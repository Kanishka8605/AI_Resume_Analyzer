import re
from typing import List, Dict, Any

SECTION_PATTERNS = {
    "Summary": [
        r'\bsummary\b', r'\bprofessional summary\b', r'\bcareer summary\b',
        r'\bprofile\b', r'\bprofessional profile\b', r'\bobjective\b', r'\bcareer objective\b'
    ],
    "Experience": [
        r'\bexperience\b', r'\bwork experience\b', r'\bprofessional experience\b',
        r'\bwork history\b', r'\bemployment history\b', r'\bhistory\b'
    ],
    "Education": [
        r'\beducation\b', r'\bacademics\b', r'\bacademic background\b',
        r'\beducational background\b', r'\bdegrees\b'
    ],
    "Skills": [
        r'\bskills\b', r'\btechnical skills\b', r'\bcore competencies\b',
        r'\bkey skills\b', r'\bexpertise\b', r'\btechnologies\b'
    ],
    "Projects": [
        r'\bprojects\b', r'\bpersonal projects\b', r'\bkey projects\b',
        r'\bacademic projects\b', r'\bportfolio\b'
    ],
    "Certifications": [
        r'\bcertifications\b', r'\bcertificates\b', r'\blicenses\b',
        r'\bcourses\b'
    ]
}

def analyze_sections(text: str) -> List[Dict[str, Any]]:
    """
    Analyzes the presence of key sections in the resume and returns their status and score.
    """
    text_lower = text.lower()
    results = []
    
    # Split text into lines for length/detail analysis of sections
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    for section, patterns in SECTION_PATTERNS.items():
        present = False
        match_idx = -1
        
        # Check if the section name is present as a standalone heading or near it
        for pattern in patterns:
            # We match word boundaries, allowing optional surrounding formatting/spaces
            match = re.search(r'(?:^|[\r\n])\s*(?:#|\*|-)*\s*(' + pattern + r')\s*(?:#|\*|-|:)*\s*(?:$|[\r\n])', text_lower)
            if match:
                present = True
                break
                
        if not present:
            # Secondary broader search if heading match failed
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    present = True
                    break
        
        # Calculate section score and feedback
        if present:
            score = 100
            feedback = f"Detected standard '{section}' section, which is good for ATS readability."
            
            # Simple content inspection fallbacks:
            # If the resume is very short, or the section has very little content, reduce score
            section_pattern = "|".join(patterns)
            # Find approximate content following the section header
            # (Just a simple heuristic for rule-based scoring feedback)
            matches = list(re.finditer(section_pattern, text_lower))
            if matches:
                start_pos = matches[0].end()
                # grab next 200 characters
                sample = text_lower[start_pos:start_pos+300].strip()
                word_count = len(sample.split())
                if word_count < 10:
                    score = 40
                    feedback = f"The '{section}' section was detected but appears extremely brief. Add more details."
                elif section == "Experience" and not any(char.isdigit() for char in sample):
                    score = 70
                    feedback = "Experience section detected, but it lacks metrics/dates. Quantify achievements (e.g., 'saved 20% time')."
                elif section == "Summary" and len(sample.split()) > 100:
                    score = 80
                    feedback = "Summary section is present but a bit long. Keep professional summaries under 75 words."
        else:
            score = 0
            feedback = f"Missing standard '{section}' section. It is highly recommended to add this section."
            if section in ["Experience", "Education", "Skills"]:
                score = 0
                feedback = f"Critical Error: Missing '{section}' section. Re-add this immediately to pass ATS scanners."
                
        results.append({
            "name": section,
            "present": present,
            "score": score,
            "feedback": feedback
        })
        
    return results
