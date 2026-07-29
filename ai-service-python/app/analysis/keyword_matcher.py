import re
from typing import List, Dict, Any, Tuple

ROLE_KEYWORDS = {
    "frontend": [
        "react", "javascript", "typescript", "css", "html", "vue", "angular", "tailwind",
        "webpack", "vite", "next.js", "sass", "redux", "jest", "responsive design",
        "ui/ux", "browser", "accessibility", "dom", "rest api"
    ],
    "backend": [
        "node", "express", "python", "django", "flask", "fastapi", "java", "spring boot",
        "golang", "c#", ".net", "postgresql", "mysql", "mongodb", "redis", "rest api",
        "graphql", "docker", "microservices", "kubernetes", "grpc", "aws", "sql"
    ],
    "fullstack": [
        "react", "javascript", "typescript", "node", "express", "html", "css", "sql", "postgresql",
        "mongodb", "api", "git", "aws", "docker", "next.js", "rest api", "graphql", "databases"
    ],
    "data science": [
        "python", "sql", "machine learning", "deep learning", "nlp", "pandas", "numpy",
        "scikit-learn", "tensorflow", "pytorch", "tableau", "power bi", "data visualization",
        "statistics", "data modeling", "big data", "spark", "r programming", "data analysis"
    ],
    "devops": [
        "docker", "kubernetes", "jenkins", "git", "ci/cd", "terraform", "ansible", "aws",
        "azure", "gcp", "linux", "bash", "shell scripting", "prometheus", "grafana", "nginx"
    ],
    "product manager": [
        "product roadmap", "agile", "scrum", "user stories", "product strategy", "sql",
        "kpi", "metrics", "analytics", "market research", "stakeholder management", "jira",
        "wireframing", "ab testing", "cross-functional"
    ]
}

# Fallback generic keywords for general resumes
GENERIC_KEYWORDS = [
    "git", "agile", "scrum", "collaboration", "communication", "problem solving", 
    "project management", "testing", "deployment", "software development", "databases", "cloud"
]

def match_keywords(text: str, target_role: str = "") -> Tuple[float, List[str], List[str]]:
    """
    Compares resume text to role-specific keywords.
    Returns:
      - Match score (0.0 to 100.0)
      - List of found keywords
      - List of missing keywords
    """
    text_lower = text.lower()
    keywords_to_check = []
    selected_role = "general"
    
    # 1. Determine key list based on target role
    if target_role:
        role_normalized = target_role.lower().strip()
        matched = False
        for role_key, kw_list in ROLE_KEYWORDS.items():
            if role_key in role_normalized or role_normalized in role_key:
                keywords_to_check = kw_list
                selected_role = role_key
                matched = True
                break
        
        # If no direct match, check if we can match broad synonyms
        if not matched:
            if any(w in role_normalized for w in ["react", "vue", "angular", "css", "web"]):
                keywords_to_check = ROLE_KEYWORDS["frontend"]
                selected_role = "frontend"
            elif any(w in role_normalized for w in ["database", "node", "django", "java", "spring", "c#", "server"]):
                keywords_to_check = ROLE_KEYWORDS["backend"]
                selected_role = "backend"
            elif any(w in role_normalized for w in ["full-stack", "full stack"]):
                keywords_to_check = ROLE_KEYWORDS["fullstack"]
                selected_role = "fullstack"
            elif any(w in role_normalized for w in ["data", "ml", "ai", "model", "analysis"]):
                keywords_to_check = ROLE_KEYWORDS["data science"]
                selected_role = "data science"
            elif any(w in role_normalized for w in ["devops", "cloud", "aws", "azure", "docker", "pipeline"]):
                keywords_to_check = ROLE_KEYWORDS["devops"]
                selected_role = "devops"
            elif any(w in role_normalized for w in ["product", "project", "scrum", "agile", "manager"]):
                keywords_to_check = ROLE_KEYWORDS["product manager"]
                selected_role = "product manager"
                
    # Fallback to generic keywords if no role is matched or provided
    if not keywords_to_check:
        keywords_to_check = GENERIC_KEYWORDS
        
    found_keywords = []
    missing_keywords = []
    
    for keyword in keywords_to_check:
        # Match word boundaries or handle punctuation like next.js / ui/ux
        pattern = r'\b' + re.escape(keyword) + r'\b'
        # For keywords with special characters, match exactly in text
        if not keyword.isalnum():
            # broader check
            if keyword in text_lower:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        else:
            if re.search(pattern, text_lower):
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
                
    # Match percentage calculation
    total = len(keywords_to_check)
    match_score = (len(found_keywords) / total) * 100 if total > 0 else 100.0
    
    return round(match_score, 1), found_keywords, missing_keywords
