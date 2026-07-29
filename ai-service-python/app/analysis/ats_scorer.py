import re
from typing import List, Dict, Any, Tuple

def calculate_ats_score(
    text: str,
    sections: List[Dict[str, Any]],
    keyword_score: float
) -> Tuple[int, Dict[str, Any]]:
    """
    Computes a rule-based ATS Compatibility Score (0-100) and returns a score breakdown.
    Breakdown weights:
      - Contact Details: 20 points
      - Resume Length / Word Count: 15 points
      - Section Headers presence: 35 points
      - Keyword Match: 30 points
    """
    score = 0
    breakdown = {
        "contactInfo": 0,
        "wordCount": 0,
        "sections": 0,
        "keywords": 0
    }
    
    # 1. Contact details check (20 points max)
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    web_match = re.search(r'(github\.com|linkedin\.com|github\.io|portfolio|www\.)', text.lower())
    
    contact_points = 0
    if email_match:
        contact_points += 7
    if phone_match:
        contact_points += 7
    if web_match:
        contact_points += 6
        
    breakdown["contactInfo"] = contact_points
    score += contact_points
    
    # 2. Word Count check (15 points max)
    words = text.split()
    word_count = len(words)
    
    word_points = 0
    if 400 <= word_count <= 850:
        word_points = 15
    elif 250 <= word_count < 400 or 850 < word_count <= 1300:
        word_points = 10
    else:
        word_points = 5
        
    breakdown["wordCount"] = word_points
    score += word_points
    
    # 3. Section Headers (35 points max)
    # Check sections list. Weighting:
    # Experience (10), Education (10), Skills (10), Summary (5)
    section_points = 0
    sections_map = {s["name"]: s["present"] for s in sections}
    
    if sections_map.get("Experience", False):
        section_points += 10
    if sections_map.get("Education", False):
        section_points += 10
    if sections_map.get("Skills", False):
        section_points += 10
    if sections_map.get("Summary", False):
        section_points += 5
        
    breakdown["sections"] = section_points
    score += section_points
    
    # 4. Keyword Match Score (30 points max)
    keyword_points = round((keyword_score / 100.0) * 30)
    breakdown["keywords"] = keyword_points
    score += keyword_points
    
    # Bound score between 0 and 100
    final_score = max(0, min(100, score))
    
    return final_score, breakdown
