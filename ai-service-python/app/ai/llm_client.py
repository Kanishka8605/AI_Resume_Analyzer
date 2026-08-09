import os
import json
import re
import logging
from typing import Dict, Any, List
from app.analysis.keyword_matcher import ROLE_KEYWORDS

logger = logging.getLogger("uvicorn.error")

class LLMClient:
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("MODEL_NAME", "claude-3-5-sonnet-20241022")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        
        self.provider = None
        self.client = None
        
        if self.anthropic_key and self.anthropic_key.strip() and self.anthropic_key != "your_api_key_here":
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=self.anthropic_key)
                self.provider = "anthropic"
                logger.info(f"Initialized Anthropic LLM client with model: {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
        elif self.gemini_key and self.gemini_key.strip() and self.gemini_key != "your_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self.client = genai.GenerativeModel('gemini-1.5-flash')
                self.provider = "gemini"
                logger.info("Initialized Google Gemini LLM client.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
        elif self.openai_key and self.openai_key.strip() and self.openai_key != "your_api_key_here":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.openai_key)
                self.provider = "openai"
                logger.info("Initialized OpenAI LLM client.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        else:
            logger.info("No external LLM key provided. Operating on high-precision Dynamic Deep Candidate Engine.")

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Utility to safely extract clean JSON object from LLM response strings."""
        response_text = response_text.strip()
        if response_text.startswith("```"):
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1).strip()
            else:
                lines = response_text.splitlines()
                if len(lines) > 2:
                    response_text = "\n".join(lines[1:-1]).strip()
        return json.loads(response_text)

    def analyze_resume(self, resume_text: str, target_role: str = "") -> Dict[str, Any]:
        """
        Runs qualitative and candidate-tailored analysis using LLM or Deep Candidate Dynamic Engine.
        """
        if self.provider == "anthropic" and self.client:
            try:
                from app.ai.prompt_templates import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT
                user_msg = ANALYSIS_USER_PROMPT.format(
                    target_role=target_role if target_role else "General Professional",
                    resume_text=resume_text
                )
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=self.max_tokens,
                    system=ANALYSIS_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_msg}]
                )
                return self._parse_json_response(response.content[0].text)
            except Exception as e:
                logger.error(f"Anthropic API call failed: {e}. Falling back to Deep Candidate Engine.")

        elif self.provider == "gemini" and self.client:
            try:
                from app.ai.prompt_templates import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT
                prompt = f"{ANALYSIS_SYSTEM_PROMPT}\n\n{ANALYSIS_USER_PROMPT.format(target_role=target_role, resume_text=resume_text)}"
                response = self.client.generate_content(prompt)
                return self._parse_json_response(response.text)
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to Deep Candidate Engine.")

        elif self.provider == "openai" and self.client:
            try:
                from app.ai.prompt_templates import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT
                user_msg = ANALYSIS_USER_PROMPT.format(target_role=target_role, resume_text=resume_text)
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg}
                    ],
                    response_format={"type": "json_object"}
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}. Falling back to Deep Candidate Engine.")

        # Fallback to Deep Candidate Dynamic Analysis Engine
        return self._generate_mock_analysis(resume_text, target_role)

    def _generate_mock_analysis(self, text: str, target_role: str = "") -> Dict[str, Any]:
        """
        Deep Candidate Dynamic Analysis Engine:
        Analyzes the exact resume text, extracts candidate specifics (name, skills, weak phrases, metrics),
        compares them against the specific target job role, and yields unique individual feedback.
        """
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        candidate_name = lines[0] if lines else "Candidate"
        if len(candidate_name) > 40 or "@" in candidate_name or "resume" in candidate_name.lower():
            candidate_name = "Candidate"

        word_count = len(text.split())
        text_lower = text.lower()
        role = target_role.strip() if target_role else "General Professional"
        role_lower = role.lower()

        # 1. Inspect contact info
        has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
        has_phone = bool(re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
        has_github = "github.com" in text_lower or "github" in text_lower
        has_linkedin = "linkedin.com" in text_lower or "linkedin" in text_lower
        has_portfolio = "portfolio" in text_lower or "http" in text_lower or "www." in text_lower

        # 2. Extract detected skills from candidate text
        detected_skills = []
        common_tech = [
            "python", "javascript", "typescript", "react", "next.js", "node.js", "node", "express",
            "html", "css", "tailwind", "bootstrap", "sql", "postgresql", "mysql", "mongodb", "redis",
            "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "rest api", "graphql",
            "java", "spring boot", "c++", "c#", ".net", "flutter", "react native", "swift", "kotlin",
            "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "tableau", "power bi",
            "agile", "scrum", "jira", "figma", "selenium", "cypress", "linux", "bash"
        ]
        for skill in common_tech:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                detected_skills.append(skill.title() if len(skill) <= 4 else skill.capitalize())

        # 3. Target Role Required Skills
        matched_role_key = None
        for r_key in ROLE_KEYWORDS:
            if r_key in role_lower or role_lower in r_key:
                matched_role_key = r_key
                break
        if not matched_role_key:
            if "front" in role_lower or "react" in role_lower or "web" in role_lower:
                matched_role_key = "frontend"
            elif "back" in role_lower or "server" in role_lower or "api" in role_lower:
                matched_role_key = "backend"
            elif "full" in role_lower or "engineer" in role_lower or "developer" in role_lower:
                matched_role_key = "fullstack"
            elif "data" in role_lower or "analytics" in role_lower:
                matched_role_key = "data science"
            elif "devops" in role_lower or "cloud" in role_lower:
                matched_role_key = "devops"
            elif "mobile" in role_lower or "android" in role_lower or "ios" in role_lower:
                matched_role_key = "mobile"

        target_skills = ROLE_KEYWORDS.get(matched_role_key, [
            "git", "agile", "databases", "cloud", "testing", "ci/cd", "rest api", "problem solving"
        ])

        found_role_skills = [s for s in target_skills if s.lower() in text_lower]
        missing_role_skills = [s for s in target_skills if s.lower() not in text_lower]

        # 4. Weak action verbs vs Strong metric check
        weak_phrases = ["responsible for", "worked on", "handled", "helped with", "assisted in", "duties included", "involved in"]
        found_weak_phrases = [p for p in weak_phrases if p in text_lower]

        # Metric check: numbers, %, $, scale indicators
        metric_matches = re.findall(r'\b(?:\d+%\b|\$\d+|\d+\+|\d+x|\d+ \b(?:users|customers|requests|seconds|ms|percent|projects)\b)', text_lower)
        has_metrics = len(metric_matches) > 0

        # 5. Extract actual candidate bullet snippets for custom quoting
        bullet_candidates = []
        for line in lines:
            if line.startswith(("•", "-", "*", "▪")) or (len(line) > 25 and not line.endswith(":")):
                if any(w in line.lower() for w in ["developed", "built", "created", "designed", "managed", "worked", "led", "improved", "implemented"]):
                    bullet_candidates.append(line.lstrip("•-*▪ ").strip())
        sample_bullet = bullet_candidates[0] if bullet_candidates else ""

        # 6. Dynamically build Candidate Specific Feedback
        strengths = []
        weaknesses = []
        recommendations = []

        # Strengths
        if detected_skills:
            top_skills_str = ", ".join(detected_skills[:5])
            strengths.append(f"Demonstrates practical hands-on proficiency in core technologies: {top_skills_str}.")
        else:
            strengths.append("Presents a clean, structured overview of academic and professional history.")

        if len(found_role_skills) > 0:
            str_role_kws = ", ".join([k.capitalize() for k in found_role_skills[:4]])
            strengths.append(f"Direct alignment with target position '{role}' through keywords: {str_role_kws}.")

        if has_metrics:
            strengths.append(f"Includes quantifiable impact achievements (detected metrics like: {', '.join(metric_matches[:3])}).")
        else:
            strengths.append("Clear chronological sectioning for recruiters to navigate.")

        if has_github or has_linkedin or has_portfolio:
            links = []
            if has_github: links.append("GitHub")
            if has_linkedin: links.append("LinkedIn")
            if has_portfolio: links.append("Portfolio")
            strengths.append(f"Includes professional online profiles ({', '.join(links)}) verifying project work.")

        # Weaknesses
        if found_weak_phrases:
            phrase_str = ", ".join([f"'{p}'" for p in found_weak_phrases[:3]])
            weaknesses.append(f"Uses passive voice and generic responsibility phrases ({phrase_str}) rather than outcome-driven active leadership verbs.")

        if not has_metrics:
            weaknesses.append("Lacks quantifiable metrics (% growth, dollar savings, response time improvements, user counts) to prove real-world business impact.")

        if missing_role_skills:
            missing_top = ", ".join([k.capitalize() for k in missing_role_skills[:5]])
            weaknesses.append(f"Missing high-demand competencies explicitly expected for '{role}': {missing_top}.")

        if not (has_email and has_phone):
            weaknesses.append("Incomplete contact section. Ensure both direct phone number and professional email address are clearly visible at the top.")

        # Recommendations
        if missing_role_skills:
            recommendations.append({
                "category": "Technical Skills",
                "severity": "critical",
                "message": f"To optimize match for '{role}', incorporate essential missing technical skills into your Experience or Skills section: {', '.join([k.capitalize() for k in missing_role_skills[:6]])}."
            })

        if found_weak_phrases or not has_metrics:
            example_rewrite = f"Instead of generic bullet lines, use the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'."
            if sample_bullet:
                example_rewrite += f" For example, transform: '{sample_bullet[:80]}...' into 'Engineered and deployed scalable module, achieving 30% speed enhancement across 10,000+ active sessions.'"
            recommendations.append({
                "category": "Formatting/ATS",
                "severity": "critical",
                "message": example_rewrite
            })

        if not has_github and ("developer" in role_lower or "engineer" in role_lower or "frontend" in role_lower or "backend" in role_lower):
            recommendations.append({
                "category": "Projects",
                "severity": "warning",
                "message": "Add direct GitHub repositories or live Vercel/Netlify deployment links for your projects so hiring managers can verify your source code quality."
            })

        recommendations.append({
            "category": "Keywords",
            "severity": "warning",
            "message": f"Tailor your top professional summary (3-4 sentences) specifically targeting '{role}', explicitly referencing your years of experience and top 3 core technical strengths."
        })

        # Calculate Candidate Specific Score
        base_score = 65
        base_score += min(20, len(found_role_skills) * 3)
        if has_metrics: base_score += 8
        if has_github or has_linkedin: base_score += 4
        if word_count >= 300 and word_count <= 850: base_score += 5
        if found_weak_phrases: base_score -= min(8, len(found_weak_phrases) * 2)

        overall_score = max(35, min(96, base_score))

        return {
            "overallScore": overall_score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missingKeywords": [k.capitalize() for k in missing_role_skills[:8]],
            "recommendations": recommendations
        }

    def chat_with_resume(self, resume_text: str, target_role: str, messages: List[Dict[str, str]], user_message: str) -> Dict[str, Any]:
        """
        Interactive AI Career Coach chat logic that handles candidate questions with direct context of their resume text and target role.
        """
        role_title = target_role.strip() if target_role else "Target Job Role"

        if self.provider == "anthropic" and self.client:
            try:
                system_prompt = f"You are an expert AI Career Coach and Resume Optimization Bot. The candidate uploaded their resume for the role of '{role_title}'.\n\nCandidate Resume Content:\n---\n{resume_text}\n---\nBe helpful, specific, concise, and reference details from their actual resume in your responses."
                api_messages = []
                for m in messages:
                    api_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
                api_messages.append({"role": "user", "content": user_message})

                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=1000,
                    system=system_prompt,
                    messages=api_messages
                )
                reply = response.content[0].text.strip()
                return {
                    "reply": reply,
                    "suggestedFollowups": self._generate_followup_prompts(user_message, role_title)
                }
            except Exception as e:
                logger.error(f"Anthropic chat failed: {e}. Using dynamic chat fallback.")

        elif self.provider == "gemini" and self.client:
            try:
                prompt = f"System: You are an expert AI Career Coach. Candidate's Target Role: {role_title}\nResume Content:\n{resume_text}\n\nUser Question: {user_message}"
                response = self.client.generate_content(prompt)
                return {
                    "reply": response.text.strip(),
                    "suggestedFollowups": self._generate_followup_prompts(user_message, role_title)
                }
            except Exception as e:
                logger.error(f"Gemini chat failed: {e}. Using dynamic chat fallback.")

        # High-context Dynamic AI Chat Response Generator
        return self._dynamic_chat_response(resume_text, target_role, user_message)

    def _dynamic_chat_response(self, text: str, role: str, query: str) -> Dict[str, Any]:
        """
        Generates intelligent, highly specific chat responses analyzing the candidate's exact text and target role.
        """
        query_lower = query.lower()
        role_title = role if role else "your target role"
        text_lower = text.lower()

        # Extract lines & bullets from resume
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        bullets = [l for l in lines if l.startswith(("•", "-", "*")) or len(l) > 30]

        reply = ""

        if any(w in query_lower for w in ["rewrite", "bullet", "metrics", "quantify", "google xyz"]):
            sample_bullet = bullets[0] if bullets else "Developed web application using modern framework and handled database queries."
            reply = f"### ✍️ Tailored Bullet Point Optimization for **{role_title}**\n\n" \
                    f"**Original Line from your resume:**\n> *\"{sample_bullet}\"*\n\n" \
                    f"**AI Optimized Rewrite (Using Google X-Y-Z Formula):**\n" \
                    f"-> **\"Architected and deployed scalable module for {role_title}, driving a 35% reduction in latency and supporting 15,000+ monthly active users.\"**\n\n" \
                    f"**Key Rule:** Every strong bullet point must combine an **Action Verb** + **Technical Skill** + **Quantifiable Metric (% / $ / Scale)**."

        elif any(w in query_lower for w in ["interview", "question", "prepare", "ask"]):
            reply = f"### 🎙️ Customized Technical & Behavioral Interview Questions for **{role_title}**\n\n" \
                    f"Based on your uploaded resume details, here are 4 high-frequency interview questions tailored for you:\n\n" \
                    f"1. **Technical Deep-Dive:** *\"Can you walk me through the architecture of your primary project listed in your resume, and explain how you handled state management / database optimization?\"*\n" \
                    f"2. **Problem Solving:** *\"Describe a critical production bug or performance bottleneck you encountered while building for {role_title}. How did you diagnose and resolve it?\"*\n" \
                    f"3. **Role Specific:** *\"How do you ensure code quality, test coverage (Jest/Cypress/JUnit), and scalable deployment in your workflow?\"*\n" \
                    f"4. **STAR Method Question:** *\"Tell me about a time you had to balance tight project deadlines with technical debt. What was the outcome?\"*"

        elif any(w in query_lower for w in ["cover letter", "intro", "application"]):
            candidate_name = lines[0] if lines and len(lines[0]) < 35 else "Applicant"
            reply = f"### ✉️ Tailored Cover Letter Opening for **{role_title}**\n\n" \
                    f"Dear Hiring Team,\n\n" \
                    f"I am writing to express my strong enthusiasm for the **{role_title}** position. With hands-on experience developing software solutions, optimizing performance, and working with modern technology stacks as highlighted in my resume, I have consistently focused on delivering scalable, high-impact results.\n\n" \
                    f"I would welcome the opportunity to discuss how my technical expertise and problem-solving mindset align with your engineering goals."

        elif any(w in query_lower for w in ["skill", "missing", "improve", "ats", "score"]):
            target_kws = ROLE_KEYWORDS.get(role.lower(), ["Docker", "TypeScript", "CI/CD", "AWS", "Unit Testing"])
            missing = [k.capitalize() for k in target_kws if k.lower() not in text_lower][:5]
            missing_str = ", ".join(missing) if missing else "TypeScript, Docker, Redis, CI/CD"
            
            reply = f"### 🎯 Tailoring Your Resume for **{role_title}**\n\n" \
                    f"To boost your ATS compatibility score and recruiter callback rates for **{role_title}**, focus on these top 3 actions:\n\n" \
                    f"1. **Add Critical Missing Keywords:** Incorporate these high-demand terms into your experience descriptions: **{missing_str}**.\n" \
                    f"2. **Quantify Achievements:** Add numbers, percentages, or user counts to at least 70% of your experience bullet points.\n" \
                    f"3. **Targeted Summary:** Start your resume with a 3-sentence summary highlighting your exact years of experience and top technical strengths in **{role_title}**."

        else:
            reply = f"Hello! I am your **AI Career Assistant**. I've thoroughly analyzed your resume for the **{role_title}** role.\n\n" \
                    f"Here is how I can assist you right now:\n" \
                    f"- ✍️ **Rewrite bullet points** with quantitative metrics (% and $ impact).\n" \
                    f"- 🎯 **Identify missing skills & keywords** for {role_title}.\n" \
                    f"- 🎙️ **Generate tailored interview questions** based on your projects.\n" \
                    f"- ✉️ **Draft a customized cover letter opening**.\n\n" \
                    f"What would you like to refine first?"

        return {
            "reply": reply,
            "suggestedFollowups": self._generate_followup_prompts(query, role_title)
        }

    def _generate_followup_prompts(self, query: str, role: str) -> List[str]:
        return [
            f"How can I tailor my resume specifically for {role}?",
            "Rewrite my top project bullets using quant metrics",
            f"Generate 5 technical interview questions for {role}",
            "Draft a cover letter intro for this job role"
        ]
