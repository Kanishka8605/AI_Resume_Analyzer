import os
import json
import re
import logging
from typing import Dict, Any
from anthropic import Anthropic
from app.ai.prompt_templates import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT

logger = logging.getLogger("uvicorn.error")

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = os.getenv("MODEL_NAME", "claude-3-5-sonnet-20241022")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        
        if self.api_key and self.api_key.strip() and self.api_key != "your_api_key_here":
            self.client = Anthropic(api_key=self.api_key)
            logger.info(f"Anthropic LLM Client initialized with model: {self.model}")
        else:
            logger.warning("No valid ANTHROPIC_API_KEY detected in env. Switched to smart MOCK analysis engine.")
            self.client = None

    def analyze_resume(self, resume_text: str, target_role: str = "") -> Dict[str, Any]:
        """
        Sends the parsed resume text to Anthropic Claude or falls back to mock logic if unavailable.
        """
        if not self.client:
            return self._generate_mock_analysis(resume_text, target_role)

        try:
            user_msg = ANALYSIS_USER_PROMPT.format(
                target_role=target_role if target_role else "General Professional",
                resume_text=resume_text
            )

            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=ANALYSIS_SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": user_msg}
                ]
            )

            response_text = response.content[0].text.strip()
            
            # Clean markdown code blocks if the model wrapped the JSON
            if response_text.startswith("```"):
                # Match ```json ... ``` or similar
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(1).strip()
                else:
                    # Strip first and last line as a fallback
                    lines = response_text.splitlines()
                    if len(lines) > 2:
                        response_text = "\n".join(lines[1:-1]).strip()

            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error calling Anthropic API: {str(e)}. Falling back to mock analysis.")
            return self._generate_mock_analysis(resume_text, target_role)

    def _generate_mock_analysis(self, text: str, target_role: str = "") -> Dict[str, Any]:
        """
        Generates a realistic mock resume analysis based on input text metrics.
        This allows full application testing and verification without active api keys.
        """
        word_count = len(text.split())
        role = target_role if target_role else "General Professional"
        
        # Analyze basic keywords in input
        text_lower = text.lower()
        has_metrics = any(char.isdigit() and "%" in text_lower or "$" in text_lower for char in text)
        
        # Build dynamic lists
        strengths = []
        weaknesses = []
        recommendations = []
        missing_keywords = []

        # 1. Strengths
        if word_count > 300:
            strengths.append("Detailed layout with solid density of text content.")
        else:
            strengths.append("Concise resume layout, avoiding unnecessary fluff.")
            
        if "education" in text_lower:
            strengths.append("Clear academic background listed with degree info.")
        if "experience" in text_lower or "history" in text_lower:
            strengths.append("Structured work history with timeline listings.")
        if has_metrics:
            strengths.append("Strong usage of quantitative metrics to show achievements.")
        else:
            strengths.append("Professional styling and clear readable typography structure.")

        # 2. Weaknesses
        if not has_metrics:
            weaknesses.append("Lack of quantifiable results (e.g. percentages, dollar figures, team sizes).")
        if word_count < 300:
            weaknesses.append("Resume is too short; lacks elaboration on projects and key accomplishments.")
        if "summary" not in text_lower and "objective" not in text_lower:
            weaknesses.append("No professional summary statement at the top of the page.")
        if "certifications" not in text_lower and "courses" not in text_lower:
            weaknesses.append("Missing professional development or certifications section.")

        # 3. Missing Keywords & Target Role Suggestions
        if "frontend" in role.lower():
            missing_keywords = ["TypeScript", "Next.js", "Redux Toolkit", "Webpack", "Tailwind CSS", "Jest"]
            recommendations.append({
                "category": "Technical Skills",
                "severity": "critical",
                "message": "Add modern JavaScript/TypeScript frameworks. Explicitly mention state management (Redux/Zustand) and unit testing (Jest/Cypress)."
            })
        elif "backend" in role.lower():
            missing_keywords = ["Docker", "Kubernetes", "Redis", "PostgreSQL", "CI/CD pipelines", "gRPC"]
            recommendations.append({
                "category": "Technical Skills",
                "severity": "critical",
                "message": "Ensure backend architecture keywords are highlighted, including database clustering, caching (Redis/Memcached), and container tooling."
            })
        elif "data" in role.lower():
            missing_keywords = ["Pandas", "Scikit-Learn", "SQL Queries", "TensorFlow", "Tableau", "Data Modeling"]
            recommendations.append({
                "category": "Technical Skills",
                "severity": "critical",
                "message": "Highlight specific machine learning packages (scikit-learn, pytorch) and database languages rather than just generic 'coding' descriptions."
            })
        else:
            missing_keywords = ["Agile Methodologies", "Git Version Control", "Cloud Infrastructure", "System Architecture"]
            recommendations.append({
                "category": "Technical Skills",
                "severity": "warning",
                "message": "Incorporate key industry tools such as Git, Docker, or Agile processes into your skills index."
            })

        # 4. Standard recommendations
        if not has_metrics:
            recommendations.append({
                "category": "Formatting/ATS",
                "severity": "critical",
                "message": "Rewrite bullet points using the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Example: 'Boosted search speed by 35% through query index improvements.'"
            })
        if word_count < 300:
            recommendations.append({
                "category": "Projects",
                "severity": "warning",
                "message": "Expand your personal projects. Include details about tech stacks, individual contributions, and host links (e.g. GitHub, Vercel)."
            })
        if "summary" not in text_lower:
            recommendations.append({
                "category": "Formatting/ATS",
                "severity": "warning",
                "message": "Create a 3-sentence professional summary at the very top. Focus on years of experience, core skill pillars, and what you aim to achieve."
            })

        # Mock score
        overall_score = 68
        if has_metrics:
            overall_score += 10
        if word_count > 400:
            overall_score += 7
            
        overall_score = min(94, overall_score)

        return {
            "overallScore": overall_score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missingKeywords": missing_keywords,
            "recommendations": recommendations
        }
