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
    "mobile": [
        "react native", "flutter", "swift", "kotlin", "android", "ios", "xcode", "mobile app",
        "dart", "firebase", "sqlite", "rest api", "push notifications", "state management"
    ],
    "data science": [
        "python", "sql", "machine learning", "deep learning", "nlp", "pandas", "numpy",
        "scikit-learn", "tensorflow", "pytorch", "tableau", "power bi", "data visualization",
        "statistics", "data modeling", "big data", "spark", "r programming", "data analysis"
    ],
    "data analyst": [
        "sql", "excel", "tableau", "power bi", "python", "r", "data cleaning", "statistics",
        "dashboards", "business intelligence", "etl", "kpi", "reporting", "data visualization"
    ],
    "machine learning": [
        "python", "pytorch", "tensorflow", "scikit-learn", "deep learning", "neural networks",
        "computer vision", "nlp", "llm", "transformers", "hugging face", "model deployment",
        "mlops", "feature engineering", "data pipelines"
    ],
    "devops": [
        "docker", "kubernetes", "jenkins", "git", "ci/cd", "terraform", "ansible", "aws",
        "azure", "gcp", "linux", "bash", "shell scripting", "prometheus", "grafana", "nginx"
    ],
    "cloud engineer": [
        "aws", "azure", "gcp", "terraform", "cloudformation", "iam", "s3", "ec2", "vpc",
        "serverless", "lambda", "cloud security", "networking", "ci/cd", "containerization"
    ],
    "cybersecurity": [
        "penetration testing", "vulnerability assessment", "siem", "firewall", "network security",
        "soc", "incident response", "wireshark", "python", "compliance", "cissp", "cryptography",
        "identity access management", "ethical hacking"
    ],
    "product manager": [
        "product roadmap", "agile", "scrum", "user stories", "product strategy", "sql",
        "kpi", "metrics", "analytics", "market research", "stakeholder management", "jira",
        "wireframing", "ab testing", "cross-functional"
    ],
    "ui/ux": [
        "figma", "sketch", "adobe xd", "user research", "wireframing", "prototyping",
        "user flows", "design systems", "usability testing", "ui design", "ux research", "interaction design"
    ],
    "qa tester": [
        "automation testing", "selenium", "cypress", "playwright", "jest", "postman",
        "test cases", "qa", "regression testing", "api testing", "jira", "bug tracking", "agile"
    ],
    "embedded systems": [
        "c", "c++", "microcontrollers", "rtos", "embedded linux", "arm", "stm32",
        "firmware", "i2c", "spi", "uart", "pcb", "debugging", "hardware"
    ],
    "database administrator": [
        "sql", "postgresql", "mysql", "oracle", "sql server", "database optimization",
        "indexing", "backup recovery", "replication", "performance tuning", "nosql", "mongodb"
    ],
    "scrum master": [
        "scrum", "agile", "jira", "kanban", "sprint planning", "retrospectives",
        "facilitation", "coaching", "servant leadership", "team velocity"
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
        
        # If no direct match, check synonyms and keyword hits
        if not matched:
            if any(w in role_normalized for w in ["react", "vue", "angular", "css", "web", "frontend"]):
                keywords_to_check = ROLE_KEYWORDS["frontend"]
            elif any(w in role_normalized for w in ["node", "django", "flask", "java", "spring", "c#", "backend", "api"]):
                keywords_to_check = ROLE_KEYWORDS["backend"]
            elif any(w in role_normalized for w in ["full-stack", "fullstack", "software engineer", "developer"]):
                keywords_to_check = ROLE_KEYWORDS["fullstack"]
            elif any(w in role_normalized for w in ["mobile", "android", "ios", "flutter", "react native"]):
                keywords_to_check = ROLE_KEYWORDS["mobile"]
            elif any(w in role_normalized for w in ["data science", "machine learning", "ml", "ai"]):
                keywords_to_check = ROLE_KEYWORDS["machine learning"]
            elif any(w in role_normalized for w in ["data analyst", "analytics", "business intelligence"]):
                keywords_to_check = ROLE_KEYWORDS["data analyst"]
            elif any(w in role_normalized for w in ["devops", "sre", "infrastructure"]):
                keywords_to_check = ROLE_KEYWORDS["devops"]
            elif any(w in role_normalized for w in ["cloud", "aws", "azure", "gcp"]):
                keywords_to_check = ROLE_KEYWORDS["cloud engineer"]
            elif any(w in role_normalized for w in ["cyber", "security", "soc"]):
                keywords_to_check = ROLE_KEYWORDS["cybersecurity"]
            elif any(w in role_normalized for w in ["ui", "ux", "design", "figma"]):
                keywords_to_check = ROLE_KEYWORDS["ui/ux"]
            elif any(w in role_normalized for w in ["qa", "test", "quality"]):
                keywords_to_check = ROLE_KEYWORDS["qa tester"]
            elif any(w in role_normalized for w in ["product", "scrum", "agile"]):
                keywords_to_check = ROLE_KEYWORDS["product manager"]
                
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
