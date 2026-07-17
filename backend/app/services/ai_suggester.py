import re
from typing import Any, Dict, List, Optional, Tuple

from app.services.nlp_processor import (
    calculate_batch_similarity,
    extract_keywords_tfidf,
    extract_skills_nlp,
    preprocess_text,
)


def generate_improvement_suggestions(
    analysis_result: Dict[str, Any],
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> List[Dict[str, Any]]:
    suggestions = []
    parsed = resume_data.get("parsed_data", {})
    breakdown = analysis_result.get("score_breakdown", {})
    missing_skills = analysis_result.get("missing_skills", [])
    weaknesses = analysis_result.get("weaknesses", [])

    if missing_skills:
        suggestions.append({
            "category": "skills",
            "priority": "high",
            "title": "Add Missing Skills",
            "description": f"Consider adding these skills to your resume: {', '.join(missing_skills[:5])}",
            "impact": "Could improve skill match score by up to 30%",
        })

    if breakdown.get("keyword_match", 0) < 70:
        jd_text = job_data.get("raw_text", "")
        jd_keywords = extract_keywords_tfidf(jd_text, top_n=15)
        suggestions.append({
            "category": "keywords",
            "priority": "high",
            "title": "Improve Keyword Optimization",
            "description": f"Include more job-relevant keywords like: {', '.join([kw for kw, _ in jd_keywords[:5]])}",
            "impact": "ATS systems rely on keyword matching for initial screening",
        })

    summary = parsed.get("summary")
    if not summary:
        suggestions.append({
            "category": "summary",
            "priority": "medium",
            "title": "Add a Professional Summary",
            "description": "Include a 2-3 sentence professional summary highlighting your key qualifications and career objectives.",
            "impact": "Recruiters spend an average of 7 seconds scanning a resume; a strong summary captures attention",
        })
    elif len(summary.split()) < 20:
        suggestions.append({
            "category": "summary",
            "priority": "medium",
            "title": "Expand Professional Summary",
            "description": "Your summary is brief. Aim for 3-5 sentences that highlight your experience, key skills, and career goals.",
            "impact": "A detailed summary helps recruiters quickly assess your fit for the role",
        })

    experience = parsed.get("experience", [])
    if len(experience) < 2:
        suggestions.append({
            "category": "experience",
            "priority": "medium",
            "title": "Add More Work Experience",
            "description": "Include all relevant work experiences with detailed descriptions of your responsibilities and achievements.",
            "impact": "More experience entries demonstrate a stronger career trajectory",
        })
    else:
        for i, exp in enumerate(experience[:3]):
            desc = exp.get("description", [])
            if isinstance(desc, list) and len(desc) < 2:
                suggestions.append({
                    "category": "experience",
                    "priority": "medium",
                    "title": f"Expand Description for {exp.get('title', 'Position ' + str(i+1))}",
                    "description": "Add more bullet points with quantifiable achievements (e.g., 'Increased revenue by 20%').",
                    "impact": "Quantified achievements make your experience more compelling",
                })

    projects = parsed.get("projects", [])
    if len(projects) < 2:
        suggestions.append({
            "category": "projects",
            "priority": "low",
            "title": "Include More Projects",
            "description": "Add relevant personal or professional projects that demonstrate your technical skills.",
            "impact": "Projects showcase practical application of your skills",
        })

    certifications = parsed.get("certifications", [])
    if not certifications:
        suggestions.append({
            "category": "certifications",
            "priority": "low",
            "title": "Consider Adding Certifications",
            "description": "Industry certifications can validate your skills and make your resume stand out.",
            "impact": "Certifications demonstrate commitment to professional development",
        })

    if not parsed.get("linkedin_url"):
        suggestions.append({
            "category": "format",
            "priority": "low",
            "title": "Add LinkedIn Profile",
            "description": "Include your LinkedIn profile URL to allow recruiters to learn more about your professional background.",
            "impact": "Most recruiters check LinkedIn profiles during the hiring process",
        })

    if not parsed.get("github_url") and any(
        skill in str(parsed.get("skills", [])).lower()
        for skill in ["python", "javascript", "java", "c++", "go", "rust"]
    ):
        suggestions.append({
            "category": "format",
            "priority": "low",
            "title": "Add GitHub Profile",
            "description": "Include your GitHub profile to showcase your code and contributions.",
            "impact": "A strong GitHub profile can significantly boost your credibility for technical roles",
        })

    suggestions.sort(key=lambda x: {"high": 0, "medium": 1, "low": 2}.get(x["priority"], 3))
    return suggestions


def suggest_missing_skills(
    resume_skills: List[str],
    jd_text: str,
    skill_categories: Optional[Dict[str, List[str]]] = None,
) -> List[Dict[str, Any]]:
    if skill_categories is None:
        from app.utils.constants import SKILL_CATEGORIES
        skill_categories = SKILL_CATEGORIES
    suggestions = []
    jd_lower = jd_text.lower()
    for category, skills in skill_categories.items():
        for skill in skills:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, jd_lower) and skill.lower() not in [s.lower() for s in resume_skills]:
                suggestions.append({
                    "skill": skill,
                    "category": category,
                    "reason": f"Skill '{skill}' is mentioned in the job description",
                })
    return suggestions


def recommend_summary_improvements(
    current_summary: Optional[str],
    job_data: Dict[str, Any],
    parsed_data: Dict[str, Any],
) -> Dict[str, Any]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=10)]
    skills = parsed_data.get("skills", [])[:5]
    experience = parsed_data.get("experience", [])
    years = "experienced" if len(experience) > 3 else "motivated"
    suggested_summary_parts = []
    if skills:
        suggested_summary_parts.append(
            f"{years.capitalize()} professional with expertise in {', '.join(skills[:3])}"
        )
    if jd_keywords:
        suggested_summary_parts.append(
            f"seeking to leverage skills in {', '.join(jd_keywords[:3])}"
        )
    suggested_summary = ". ".join(suggested_summary_parts) + "." if suggested_summary_parts else None
    return {
        "current_summary": current_summary,
        "suggested_summary": suggested_summary,
        "key_keywords_to_include": jd_keywords[:5],
        "suggested_skills_to_highlight": skills[:5],
    }


def generate_grammar_suggestions(resume_text: str) -> List[Dict[str, str]]:
    suggestions = []
    sentences = resume_text.split("\n")
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if re.search(r"\bi\b", sentence) and not re.search(r"\bi(?=[A-Z])", sentence):
            suggestions.append({
                "text": sentence[:80] + "..." if len(sentence) > 80 else sentence,
                "issue": "Avoid using first-person pronouns ('I') in resumes",
                "suggestion": "Rewrite in third person or remove the pronoun",
            })
        passive_patterns = [r"\bwas\s+\w+ed\b", r"\bwere\s+\w+ed\b", r"\bbeen\s+\w+ed\b"]
        for pattern in passive_patterns:
            if re.search(pattern, sentence, re.IGNORECASE):
                suggestions.append({
                    "text": sentence[:80] + "..." if len(sentence) > 80 else sentence,
                    "issue": "Passive voice detected",
                    "suggestion": "Use active voice for stronger impact (e.g., 'Led team' instead of 'Was team lead')",
                })
                break
    return suggestions[:10]


def generate_formatting_suggestions(parsed_data: Dict[str, Any]) -> List[Dict[str, str]]:
    suggestions = []
    if not parsed_data.get("name"):
        suggestions.append({
            "section": "header",
            "issue": "No name detected",
            "suggestion": "Ensure your name is prominently displayed at the top of your resume",
        })
    if not parsed_data.get("email"):
        suggestions.append({
            "section": "contact",
            "issue": "No email detected",
            "suggestion": "Include a professional email address",
        })
    if not parsed_data.get("phone"):
        suggestions.append({
            "section": "contact",
            "issue": "No phone number detected",
            "suggestion": "Include a phone number for contact",
        })
    if not parsed_data.get("summary"):
        suggestions.append({
            "section": "summary",
            "issue": "No summary/objective section found",
            "suggestion": "Add a professional summary section at the top",
        })
    skills = parsed_data.get("skills", [])
    if len(skills) < 5:
        suggestions.append({
            "section": "skills",
            "issue": f"Only {len(skills)} skills detected",
            "suggestion": "Add more relevant technical and soft skills",
        })
    experience = parsed_data.get("experience", [])
    if not experience:
        suggestions.append({
            "section": "experience",
            "issue": "No work experience detected",
            "suggestion": "Add work experience with company names, titles, and dates",
        })
    return suggestions


def suggest_project_improvements(
    projects: List[Dict[str, Any]],
    jd_text: str,
) -> List[Dict[str, Any]]:
    suggestions = []
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=10)]
    for i, project in enumerate(projects):
        proj_text = f"{project.get('name', '')} {' '.join(project.get('description', []))}"
        proj_lower = proj_text.lower()
        relevant_keywords = [kw for kw in jd_keywords if kw.lower() in proj_lower]
        if len(relevant_keywords) < 2:
            suggestions.append({
                "project": project.get("name", f"Project {i+1}"),
                "issue": "Low relevance to job description",
                "suggestion": f"Highlight aspects related to: {', '.join(jd_keywords[:3])}",
            })
        desc = project.get("description", [])
        if len(desc) < 2:
            suggestions.append({
                "project": project.get("name", f"Project {i+1}"),
                "issue": "Brief description",
                "suggestion": "Add more details: technologies used, impact, and your role",
            })
    return suggestions
