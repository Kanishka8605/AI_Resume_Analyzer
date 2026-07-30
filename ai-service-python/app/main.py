import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables before other imports
load_dotenv()

from app.models.schemas import ParseResponse, AnalyzeRequest, AnalysisResponse, SectionScore, RecommendationItem
from app.parsers.pdf_parser import parse_pdf
from app.parsers.docx_parser import parse_docx
from app.parsers.txt_parser import parse_txt
from app.analysis.section_analyzer import analyze_sections
from app.analysis.keyword_matcher import match_keywords
from app.analysis.ats_scorer import calculate_ats_score
from app.ai.llm_client import LLMClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title="AI Resume Analyzer Engine",
    description="Python microservice for document parsing and resume optimization scoring."
)

# Enable CORS for internal gateways
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_client = LLMClient()

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "resume-analyzer-python-engine"}

@app.post("/parse", response_model=ParseResponse)
async def parse_file(file: UploadFile = File(...)):
    """
    Parses PDF, DOC, DOCX, or TXT file and extracts raw text in UTF-8 format.
    """
    filename = file.filename
    content = await file.read()
    
    # Check file size (5MB limit checked in express, but safeguard here)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5MB.")

    file_type = ""
    extracted_text = ""
    
    try:
        if filename.endswith(".pdf"):
            file_type = "pdf"
            extracted_text = parse_pdf(content)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            file_type = "docx" if filename.endswith(".docx") else "doc"
            extracted_text = parse_docx(content, filename)
        elif filename.endswith(".txt"):
            file_type = "txt"
            extracted_text = parse_txt(content)
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file extension. Only .pdf, .docx, .doc, and .txt are supported."
            )
            
        if not extracted_text.strip():
            raise ValueError("No text could be extracted from this document. It may be empty or contain only image scans.")

        words = extracted_text.split()
        return ParseResponse(
            text=extracted_text,
            file_type=file_type,
            char_count=len(extracted_text),
            word_count=len(words)
        )
        
    except ValueError as ve:
        logger.error(f"Validation error parsing {filename}: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Unexpected error parsing {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal parsing error: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_resume(request: AnalyzeRequest):
    """
    Scores the resume, matches keywords against roles, and invokes Claude API for qualitative feedback.
    """
    resume_text = request.resumeText
    target_role = request.targetRole or ""
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text content is empty.")
        
    try:
        # 1. Run rule-based Section Analyzer
        sections_data = analyze_sections(resume_text)
        
        # 2. Run Keyword Matcher
        keyword_score, matched_kws, missing_rule_kws = match_keywords(resume_text, target_role)
        
        # 3. Calculate Rule-based ATS Score
        ats_score, score_breakdown = calculate_ats_score(resume_text, sections_data, keyword_score)
        
        # 4. Invoke LLM for qualitative evaluation (with safe fallback)
        try:
            llm_result = llm_client.analyze_resume(resume_text, target_role)
            if not isinstance(llm_result, dict):
                llm_result = llm_client._generate_mock_analysis(resume_text, target_role)
        except Exception as llm_err:
            logger.warning(f"LLM analysis failed: {str(llm_err)}. Using mock heuristic engine.")
            llm_result = llm_client._generate_mock_analysis(resume_text, target_role)
        
        # 5. Merge Quantitative and Qualitative elements
        # Combine ATS score (40%) and LLM qualitative score (60%) for overall score
        llm_score = llm_result.get("overallScore", 70)
        overall_score = round((ats_score * 0.4) + (llm_score * 0.6))
        overall_score = max(0, min(100, overall_score))
        
        # Union missing keywords
        llm_missing = llm_result.get("missingKeywords", [])
        if not isinstance(llm_missing, list):
            llm_missing = []
        union_missing = list(set([str(kw).strip() for kw in (llm_missing + missing_rule_kws) if str(kw).strip()]))
        
        # Filter union keywords to cap at 10 items for dashboard readability
        union_missing = sorted(union_missing, key=len)[:10]

        # Gather recommendations
        final_recommendations = []
        llm_recs = llm_result.get("recommendations", [])
        if isinstance(llm_recs, list):
            for item in llm_recs:
                if isinstance(item, dict):
                    final_recommendations.append(
                        RecommendationItem(
                            category=str(item.get("category", "Keywords")),
                            severity=str(item.get("severity", "warning")),
                            message=str(item.get("message", ""))
                        )
                    )
            
        # Add automatic recommendations for missing critical sections if not covered
        sections_map = {s["name"]: s["present"] for s in sections_data}
        for sec, present in sections_map.items():
            if not present:
                category = "Formatting/ATS"
                if sec == "Skills":
                    category = "Technical Skills"
                elif sec == "Projects":
                    category = "Projects"
                elif sec == "Certifications":
                    category = "Certifications"
                    
                final_recommendations.append(
                    RecommendationItem(
                        category=category,
                        severity="critical" if sec in ["Experience", "Education", "Skills"] else "warning",
                        message=f"Add a clear, separate '{sec}' section header. Recruiter ATS systems parse resumes section-by-section and might ignore content if titles are missing."
                    )
                )

        # Parse sections list
        section_scores = [
            SectionScore(
                name=s["name"],
                present=s["present"],
                score=s["score"],
                feedback=s["feedback"]
            ) for s in sections_data
        ]

        strengths = llm_result.get("strengths", ["Standard structure present."])
        if not isinstance(strengths, list):
            strengths = ["Standard structure present."]

        weaknesses = llm_result.get("weaknesses", ["Some details could be quantified."])
        if not isinstance(weaknesses, list):
            weaknesses = ["Some details could be quantified."]

        return AnalysisResponse(
            overallScore=overall_score,
            atsScore=ats_score,
            sections=section_scores,
            strengths=strengths,
            weaknesses=weaknesses,
            missingKeywords=union_missing,
            recommendations=final_recommendations
        )

    except Exception as e:
        logger.error(f"Analysis pipeline failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

