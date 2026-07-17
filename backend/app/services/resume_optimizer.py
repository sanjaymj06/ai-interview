import re
from typing import Any, Dict, List, Optional

from app.services.nlp_processor import extract_keywords_tfidf, tfidf_vectorize


def rewrite_summary(
    current_summary: Optional[str],
    parsed_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=10)]
    skills = parsed_data.get("skills", [])
    experience = parsed_data.get("experience", [])
    years = len(experience)
    top_skills = [s for s in skills[:5] if any(kw in s.lower() for kw in jd_keywords)] or skills[:5]
    experience_level = "seasoned" if years > 5 else "experienced" if years > 2 else "motivated"
    optimized_summary = f"{experience_level.capitalize()} professional with expertise in {', '.join(top_skills[:3])}"
    if years > 0:
        optimized_summary += f" and {years}+ years of industry experience"
    company_focus = job_data.get("company")
    if company_focus:
        optimized_summary += f" seeking to contribute to {company_focus}"
    optimized_summary += ". Passionate about delivering high-quality solutions and driving innovation."
    return {
        "original": current_summary,
        "optimized": optimized_summary,
        "keywords_added": jd_keywords[:5],
        "improvements": [
            "Added relevant keywords from job description",
            "Quantified experience level",
            "Made summary targeted to the role",
        ],
    }


def rewrite_experience_descriptions(
    experience: List[Dict[str, Any]],
    job_data: Dict[str, Any],
) -> List[Dict[str, Any]]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=15)]
    optimized = []
    for exp in experience:
        title = exp.get("title", "Position")
        descriptions = exp.get("description", [])
        if isinstance(descriptions, str):
            descriptions = [descriptions]
        optimized_descs = []
        for desc in descriptions:
            optimized_desc = desc
            if not any(kw.lower() in desc.lower() for kw in jd_keywords[:5]):
                relevant_kw = [kw for kw in jd_keywords if kw.lower() in title.lower()]
                if relevant_kw:
                    optimized_desc = f"{desc.rstrip('.')}. Utilized {relevant_kw[0]} expertise in this role."
            action_verbs = ["led", "developed", "implemented", "designed", "optimized",
                          "managed", "created", "improved", "delivered", "achieved"]
            if not any(desc.lower().startswith(verb) for verb in action_verbs):
                if desc:
                    optimized_desc = desc[0].upper() + desc[1:]
            optimized_descs.append(optimized_desc)
        optimized.append({
            **exp,
            "description": optimized_descs,
            "optimizations_applied": len(optimized_descs) - len(descriptions) + (
                1 if optimized_descs and optimized_descs != descriptions else 0
            ),
        })
    return optimized


def improve_project_descriptions(
    projects: List[Dict[str, Any]],
    job_data: Dict[str, Any],
) -> List[Dict[str, Any]]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=10)]
    optimized = []
    for proj in projects:
        name = proj.get("name", "")
        descriptions = proj.get("description", [])
        if isinstance(descriptions, str):
            descriptions = [descriptions]
        optimized_descs = []
        for desc in descriptions:
            new_desc = desc
            relevant_kw = [kw for kw in jd_keywords if kw.lower() in desc.lower()]
            if not relevant_kw:
                new_desc = f"{desc.rstrip('.')}. Applied {', '.join(jd_keywords[:2])} technologies."
            optimized_descs.append(new_desc)
        optimized.append({
            **proj,
            "description": optimized_descs,
        })
    return optimized


def optimize_skills_section(
    skills: List[str],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=20)]
    skill_lower_map = {s.lower(): s for s in skills}
    matched = [skill_lower_map[kw] for kw in jd_keywords if kw.lower() in skill_lower_map]
    unmatched = [skill_lower_map[kw] for kw in jd_keywords if kw.lower() in skill_lower_map and skill_lower_map[kw] not in matched]
    suggested_additions = [kw for kw in jd_keywords if kw.lower() not in skill_lower_map][:5]
    optimized_order = matched + [s for s in skills if s not in matched]
    return {
        "original_order": skills,
        "optimized_order": optimized_order,
        "matched_with_jd": matched,
        "suggested_additions": suggested_additions,
        "total_skills": len(skills),
    }


def generate_ats_friendly_content(
    parsed_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    jd_text = job_data.get("raw_text", "")
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=20)]
    content = {
        "suggested_sections": [],
        "keyword_density": {},
        "formatting_tips": [
            "Use standard section headings (Experience, Education, Skills)",
            "Avoid tables, columns, and graphics",
            "Use standard fonts (Arial, Calibri, Times New Roman)",
            "Save as both PDF and DOCX",
            "Include keywords naturally in context",
        ],
    }
    parsed_skills = parsed_data.get("skills", [])
    summary = parsed_data.get("summary", "")
    skills_text = " ".join(parsed_skills)
    for kw in jd_keywords:
        all_text = f"{summary} {skills_text}".lower()
        count = all_text.count(kw.lower())
        content["keyword_density"][kw] = {
            "count": count,
            "present": count > 0,
            "suggestion": "Present" if count > 0 else f"Add '{kw}' to your resume",
        }
    if not summary:
        content["suggested_sections"].append({
            "section": "Summary",
            "suggestion": "Add a professional summary incorporating key job keywords",
        })
    experience = parsed_data.get("experience", [])
    if not experience:
        content["suggested_sections"].append({
            "section": "Experience",
            "suggestion": "Add work experience with relevant keywords from the job description",
        })
    return content


def optimize_resume(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    parsed = resume_data.get("parsed_data", {})
    optimized_summary = rewrite_summary(parsed.get("summary"), parsed, job_data)
    optimized_experience = rewrite_experience_descriptions(parsed.get("experience", []), job_data)
    optimized_projects = improve_project_descriptions(parsed.get("projects", []), job_data)
    optimized_skills = optimize_skills_section(parsed.get("skills", []), job_data)
    ats_content = generate_ats_friendly_content(parsed, job_data)
    return {
        "summary": optimized_summary,
        "experience": optimized_experience,
        "projects": optimized_projects,
        "skills": optimized_skills,
        "ats_recommendations": ats_content,
    }
