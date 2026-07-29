from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ParseResponse(BaseModel):
    text: str
    file_type: str
    char_count: int
    word_count: int

class AnalyzeRequest(BaseModel):
    resumeText: str = Field(..., description="Plain text content of the resume")
    targetRole: Optional[str] = Field(None, description="Optional job target title or description")

class SectionScore(BaseModel):
    name: str = Field(..., description="Name of the section (e.g. Summary, Experience, Education, Skills, Projects)")
    present: bool = Field(..., description="Whether the section was detected")
    score: int = Field(..., description="Score for this section, 0-100")
    feedback: str = Field(..., description="Short evaluation feedback for the section")

class RecommendationItem(BaseModel):
    category: str = Field(..., description="Category (e.g. Technical Skills, Soft Skills, Keywords, Projects, Certifications, Formatting/ATS)")
    severity: str = Field(..., description="critical, warning, or good")
    message: str = Field(..., description="The actionable recommendation message")

class AnalysisResponse(BaseModel):
    overallScore: int = Field(..., description="Combined qualitative + rule-based score (0-100)")
    atsScore: int = Field(..., description="Calculated ATS compatibility score (0-100)")
    sections: List[SectionScore] = Field(..., description="Section-by-section audit scores")
    strengths: List[str] = Field(..., description="Identified strengths in the resume")
    weaknesses: List[str] = Field(..., description="Identified weaknesses or gaps in the resume")
    missingKeywords: List[str] = Field(..., description="Crucial missing keywords or skills based on target role")
    recommendations: List[RecommendationItem] = Field(..., description="Actionable improvement suggestions grouped by category and severity")
