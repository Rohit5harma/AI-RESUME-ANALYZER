import json
import re
import random
from django.conf import settings

TECH_SKILL_CATALOG = {
    "Languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C",
        "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL",
        "HTML", "CSS", "Bash", "R"
    ],
    "Frameworks & Libraries": [
        "ReactJS", "React", "React Native", "Next.js", "Vue", "Angular",
        "Node.js", "Express.js", "Express", "Django", "Django REST Framework",
        "FastAPI", "Flask", "Spring Boot", "Tailwind CSS", "Bootstrap",
        "Redux", "GraphQL", "PyTorch", "TensorFlow", "Pandas", "NumPy",
        "SciPy", "Matplotlib", "Seaborn"
    ],
    "Cloud & Tools": [
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "PostgreSQL", "MySQL",
        "MongoDB", "Redis", "SQLite", "Firebase", "Elasticsearch", "Linux",
        "Git", "GitHub", "GitLab", "CI/CD", "Nginx", "Terraform",
        "VS Code", "pytest", "Swagger UI"
    ],
    "Concepts & APIs": [
        "REST API", "GraphQL", "Microservices",
        "System Design", "Unit Testing", "Test-Driven Development",
        "Code Review", "DBMS", "Operating Systems", "OS", "DSA", "AI/ML"
    ]
}

SKILL_ALIASES = {
    "reactjs": "ReactJS",
    "react.js": "ReactJS",
    "restful api": "REST API",
    "restful apis": "REST API",
    "rest api": "REST API",
    "rest apis": "REST API",
    "express.js": "Express.js",
    "my sql": "MySQL",
    "mysql": "MySQL",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "tailwindcss": "Tailwind CSS",
    "vs code": "VS Code",
    "visual studio code": "VS Code",
    "swaggerui": "Swagger UI",
    "swagger ui": "Swagger UI",
    "operating system": "Operating Systems",
    "operating systems": "Operating Systems",
    "ai/ml": "AI/ML",
    "machine learning": "AI/ML",
    "data structures and algorithms": "DSA",
}

ALL_KNOWN_SKILLS = [skill for sublist in TECH_SKILL_CATALOG.values() for skill in sublist]

MANUAL_MISSING_KEYWORDS = [
    "CI/CD",
    "Docker",
    "AWS",
    "Unit Testing",
    "REST API",
    "Git",
    "System Design",
    "Agile",
    "Microservices",
]

def detect_skills_from_resume(resume_text: str) -> list:
    text = re.sub(r"\s+", " ", resume_text.lower()).strip()
    detected = []

    for alias, canonical in sorted(SKILL_ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        pattern = r"(?<!\w)" + re.escape(alias) + r"(?!\w)"
        if re.search(pattern, text) and canonical not in detected:
            detected.append(canonical)

    for skill in ALL_KNOWN_SKILLS:
        if skill in detected:
            continue

        if skill == "C":
            pattern = r"(?<!\w)c(?![\w+#])"
        else:
            pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

        if re.search(pattern, text):
            detected.append(skill)

    return list(dict.fromkeys(detected))

def categorize_detected_skills(detected_skills: list) -> dict:
    categorized = {
        "Languages": [],
        "Frameworks": [],
        "Cloud & Tools": [],
        "Concepts": [],
    }

    for skill in detected_skills:
        if skill in TECH_SKILL_CATALOG["Languages"]:
            categorized["Languages"].append(skill)
        elif skill in TECH_SKILL_CATALOG["Frameworks & Libraries"]:
            categorized["Frameworks"].append(skill)
        elif skill in TECH_SKILL_CATALOG["Cloud & Tools"]:
            categorized["Cloud & Tools"].append(skill)
        else:
            categorized["Concepts"].append(skill)

    return categorized

def clean_json_response(raw_text: str) -> dict:
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())

def analyze_resume_heuristic(resume_text: str) -> dict:
    lower_text = resume_text.lower()
    word_count = len(re.findall(r'\b\w+\b', resume_text))

    detected_skills = detect_skills_from_resume(resume_text)
    categorized_skills = categorize_detected_skills(detected_skills)

    metrics_patterns = [r'\b\d+%', r'\$\d+', r'\b\d+x\b', r'\b\d+\s*(?:users|clients|requests|ms|seconds|minutes|hours|days|weeks|percent)\b']
    metric_matches = sum(len(re.findall(p, lower_text)) for p in metrics_patterns)

    sections = ["experience", "education", "skills", "projects", "certifications", "summary"]
    present_sections = [s for s in sections if s in lower_text]

    skill_score = min(40, len(detected_skills) * 3)
    metric_score = min(25, metric_matches * 5)
    section_score = min(20, len(present_sections) * 4)
    length_score = 15 if 250 <= word_count <= 900 else (10 if word_count > 900 else 8)

    ats_score = min(98, max(35, skill_score + metric_score + section_score + length_score))

    detected_lower = {skill.lower() for skill in detected_skills}
    missing_keywords = [
        kw for kw in MANUAL_MISSING_KEYWORDS
        if kw.lower() not in detected_lower
    ][:5]

    strengths = []
    if len(detected_skills) >= 6:
        strengths.append(f"Strong technical breadth with {len(detected_skills)} identified core tools & languages.")
    if metric_matches >= 3:
        strengths.append("Effective use of quantifiable results and metric-driven achievements.")
    else:
        strengths.append("Clear articulation of roles, technical domains, and project experience.")
    if len(present_sections) >= 4:
        strengths.append("Well-structured document containing standard ATS-recognized section headings.")
    if "git" in lower_text or "github" in lower_text:
        strengths.append("Evidence of version control practices and collaborative development.")
    if not strengths:
        strengths.append("Foundational skills present for software engineering roles.")

    suggestions = []
    if metric_matches < 3:
        suggestions.append("Incorporate more quantifiable impact (e.g., 'reduced API response time by 30%', 'scaled to 10k+ users').")
    if missing_keywords:
        suggestions.append(f"Add key industry keywords if experienced: {', '.join(missing_keywords[:3])}.")
    if "summary" not in present_sections:
        suggestions.append("Add a concise 2-3 line Professional Summary highlighting your core stack and years of focus.")
    if word_count < 300:
        suggestions.append("Elaborate further on project responsibilities and specific architectural contributions.")
    elif word_count > 1000:
        suggestions.append("Condense resume to 1-2 focused pages for higher recruiter readability.")
    if not suggestions:
        suggestions.append("Tailor bullet points to mirror exact phrasing found in target job postings.")

    return {
        "ats_score": int(ats_score),
        "skills": detected_skills,
        "categorized_skills": categorized_skills,
        "missing_keywords": missing_keywords,
        "strengths": strengths[:4],
        "suggestions": suggestions[:4],
        "score_breakdown": {
            "keywords": min(100, int(skill_score * 2.5)),
            "impact": min(100, int(metric_score * 4)),
            "formatting": min(100, int(section_score * 5)),
            "relevance": min(100, int(length_score * 6.6))
        }
    }

def analyze_ats_match_heuristic(resume_text: str, jd_text: str) -> dict:
    lower_resume = resume_text.lower()
    lower_jd = jd_text.lower()

    jd_skills = []
    for skill in ALL_KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, lower_jd):
            jd_skills.append(skill)

    if not jd_skills:
        jd_words = re.findall(r'\b[a-zA-Z]{3,}\b', lower_jd)
        common_stop = {"with", "and", "the", "for", "that", "this", "from", "have", "will", "your", "must", "experience"}
        filtered = [w.capitalize() for w in jd_words if w not in common_stop]
        jd_skills = list(dict.fromkeys(filtered))[:10]

    matched_keywords = []
    missing_keywords = []

    for skill in jd_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, lower_resume):
            matched_keywords.append(skill)
        else:
            missing_keywords.append(skill)

    total = max(1, len(jd_skills))
    match_ratio = len(matched_keywords) / total
    ats_score = int(min(98, max(20, round(match_ratio * 85 + (12 if len(matched_keywords) > 3 else 5)))))

    recommendations = []
    if missing_keywords:
        recommendations.append(f"Incorporate missing core skills into your skills list or project bullets: {', '.join(missing_keywords[:4])}.")
    recommendations.append("Align your resume bullet point action verbs with key responsibilities described in the job post.")
    recommendations.append("Ensure your job title or summary mirrors the target role title for direct ATS keyword alignment.")
    if len(matched_keywords) < total * 0.6:
        recommendations.append("Emphasize relevant domain projects demonstrating practical application of the required technologies.")

    return {
        "ats_score": ats_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "matching_skills": matched_keywords,
        "recommendations": recommendations
    }

def analyze_standalone_resume(resume_text: str) -> dict:
    api_key = getattr(settings, "GEMINI_API_KEY", None)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""
You are an expert executive ATS resume analyzer and senior tech recruiter.
Analyze the following resume thoroughly.

Return ONLY a valid JSON object matching this structure:
{{
    "ats_score": 85,
    "skills": [],
    "missing_keywords": [],
    "strengths": ["Clear technical stack", "Strong project descriptions"],
    "suggestions": ["Add measurable metrics (e.g. % improvement) to bullet points", "Include a tailored summary"],
    "score_breakdown": {{
        "keywords": 80,
        "impact": 75,
        "formatting": 90,
        "relevance": 85
    }}
}}

Resume Content:
{resume_text}
"""
            for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        parsed = clean_json_response(response.text)
                        if "ats_score" in parsed:
                            detected_skills = detect_skills_from_resume(resume_text)
                            missing_keywords = [
                                kw for kw in MANUAL_MISSING_KEYWORDS
                                if kw.lower() not in {
                                    skill.lower() for skill in detected_skills
                                }
                            ][:5]

                            parsed["skills"] = detected_skills
                            parsed["categorized_skills"] = categorize_detected_skills(detected_skills)
                            parsed["missing_keywords"] = missing_keywords
                            parsed["ats_score"] = int(parsed["ats_score"])

                            return parsed
                except Exception:
                    continue
        except Exception:
            pass

    return analyze_resume_heuristic(resume_text)

def analyze_resume_with_gemini(resume_text: str, jd_text: str) -> dict:
    api_key = getattr(settings, "GEMINI_API_KEY", None)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""
You are an expert ATS (Applicant Tracking System) matching engine.
Compare this candidate's resume with the job description.

Return ONLY a valid JSON object in this exact format:
{{
    "ats_score": 82,
    "matched_keywords": ["Python", "Django", "REST API"],
    "missing_keywords": ["PostgreSQL", "Docker", "Kubernetes"],
    "matching_skills": ["Python", "Django", "React"],
    "recommendations": [
        "Include hands-on experience with Docker containerization.",
        "Quantify project outcomes with specific efficiency numbers.",
        "Add PostgreSQL database tuning experience to project descriptions."
    ]
}}

Job Description:
{jd_text}

Resume:
{resume_text}
"""
            for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        parsed = clean_json_response(response.text)
                        if "ats_score" in parsed:
                            parsed["ats_score"] = int(parsed["ats_score"])
                            return parsed
                except Exception:
                    continue
        except Exception:
            pass

    return analyze_ats_match_heuristic(resume_text, jd_text)

def enhance_bullet_point(bullet_text: str, target_role: str = "") -> dict:
    role_ctx = f"for a {target_role} position" if target_role else "for a technical software role"
    api_key = getattr(settings, "GEMINI_API_KEY", None)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""
You are an elite Silicon Valley resume coach.
Take this resume bullet point and rewrite it into 3 high-impact, professional alternatives {role_ctx}.
Follow the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".

Return ONLY valid JSON in this format:
{{
    "original": "{bullet_text}",
    "suggestions": [
        {{
            "style": "Metrics & Impact Focused",
            "text": "Rewritten bullet point with strong quantifiable metric..."
        }},
        {{
            "style": "Action & Leadership Driven",
            "text": "Rewritten bullet point emphasizing ownership and execution..."
        }},
        {{
            "style": "Technical Precision & Architecture",
            "text": "Rewritten bullet point emphasizing technical rigor and modern tooling..."
        }}
    ],
    "key_takeaways": "Brief tip on why these alternatives perform better with ATS and recruiters."
}}

Original Bullet Point:
{bullet_text}
"""
            for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        parsed = clean_json_response(response.text)
                        if "suggestions" in parsed and len(parsed["suggestions"]) > 0:
                            return parsed
                except Exception:
                    continue
        except Exception:
            pass

    clean_bullet = bullet_text.strip().rstrip('.')
    weak_verbs = ["worked on", "helped with", "was responsible for", "did", "created", "made", "handled", "worked with"]
    core_text = clean_bullet
    for wv in weak_verbs:
        if core_text.lower().startswith(wv):
            core_text = core_text[len(wv):].strip()
            break

    return {
        "original": bullet_text,
        "suggestions": [
            {
                "style": "Metrics & Impact Focused",
                "text": f"Architected and optimized {core_text}, boosting system throughput by 35% and supporting over 25,000 active daily transactions."
            },
            {
                "style": "Action & Leadership Driven",
                "text": f"Spearheaded end-to-end delivery of {core_text}, collaborating cross-functionally to accelerate feature deployment cycles by 3 weeks."
            },
            {
                "style": "Technical Precision & Architecture",
                "text": f"Engineered resilient solutions for {core_text} with 90%+ automated test coverage and zero production downtime during migration."
            }
        ],
        "key_takeaways": "Strong action verbs combined with measurable results (percentages, throughput, test coverage) yield 40% higher recruiter response rates."
    }