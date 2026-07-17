import re
from typing import Any, Dict, List, Optional, Tuple

from app.services.nlp_processor import (
    calculate_batch_similarity,
    extract_keywords_tfidf,
    extract_skills_nlp,
    tfidf_vectorize,
)
from app.utils.constants import SKILL_CATEGORIES


def compare_resume_with_jd(
    resume_data: Dict[str, Any], job_data: Dict[str, Any]
) -> Dict[str, Any]:
    resume_text = resume_data.get("cleaned_text", resume_data.get("raw_text", ""))
    jd_text = job_data.get("raw_text", "")
    parsed = resume_data.get("parsed_data", {})
    extracted = job_data.get("extracted_data", {})
    resume_skills = set(s.lower() for s in parsed.get("skills", []))
    jd_skills = set(
        s.lower()
        for s in extracted.get("required_skills", []) + extracted.get("preferred_skills", [])
    )
    if not jd_skills:
        jd_skills_text = extract_skills_nlp(jd_text)
        jd_skills = set(s.lower() for s in jd_skills_text)
    matched_skills = resume_skills & jd_skills
    missing_skills = jd_skills - resume_skills
    extra_skills = resume_skills - jd_skills
    skill_match_pct = (len(matched_skills) / len(jd_skills) * 100) if jd_skills else 100.0
    try:
        overall_similarity = 0.0
        if resume_text and jd_text:
            from app.services.nlp_processor import calculate_text_similarity
            overall_similarity = calculate_text_similarity(resume_text[:2000], jd_text[:2000]) * 100
    except Exception:
        overall_similarity = skill_match_pct * 0.7

    return {
        "skill_match_percentage": round(skill_match_pct, 2),
        "overall_similarity": round(overall_similarity, 2),
        "matched_skills": list(matched_skills),
        "missing_skills": list(missing_skills),
        "extra_skills": list(extra_skills),
        "resume_skills_count": len(resume_skills),
        "jd_skills_count": len(jd_skills),
    }


def find_top_matching_jobs(
    resume_data: Dict[str, Any],
    job_descriptions: List[Dict[str, Any]],
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    resume_text = resume_data.get("cleaned_text", resume_data.get("raw_text", ""))
    parsed = resume_data.get("parsed_data", {})
    resume_skills = set(s.lower() for s in parsed.get("skills", []))
    results = []
    for jd in job_descriptions:
        jd_text = jd.get("raw_text", "")
        extracted = jd.get("extracted_data", {})
        jd_skills = set(
            s.lower()
            for s in extracted.get("required_skills", []) + extracted.get("preferred_skills", [])
        )
        if not jd_skills:
            jd_skills_set = set(s.lower() for s in extract_skills_nlp(jd_text))
            jd_skills = jd_skills_set
        matched = resume_skills & jd_skills
        match_pct = (len(matched) / len(jd_skills) * 100) if jd_skills else 0
        results.append({
            "job_id": jd.get("id"),
            "title": jd.get("title"),
            "company": jd.get("company"),
            "match_percentage": round(match_pct, 2),
            "matched_skills": list(matched),
            "missing_skills": list(jd_skills - resume_skills),
        })
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results[:top_n]


def recommend_skills_to_acquire(
    resume_data: Dict[str, Any],
    job_descriptions: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    skill_frequency: Dict[str, int] = {}
    parsed = resume_data.get("parsed_data", {})
    resume_skills = set(s.lower() for s in parsed.get("skills", []))
    for jd in job_descriptions:
        extracted = jd.get("extracted_data", {})
        jd_skills = extracted.get("required_skills", []) + extracted.get("preferred_skills", [])
        if not jd_skills:
            jd_skills = extract_skills_nlp(jd.get("raw_text", ""))
        for skill in jd_skills:
            skill_lower = skill.lower()
            if skill_lower not in resume_skills:
                skill_frequency[skill_lower] = skill_frequency.get(skill_lower, 0) + 1
    sorted_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)
    recommendations = []
    for skill, count in sorted_skills[:15]:
        category = "general"
        for cat, skills in SKILL_CATEGORIES.items():
            if skill in [s.lower() for s in skills]:
                category = cat
                break
        recommendations.append({
            "skill": skill,
            "category": category,
            "frequency": count,
            "reason": f"Mentioned in {count} job description(s) you're interested in",
        })
    return recommendations


def career_suggestions(
    resume_data: Dict[str, Any],
    job_descriptions: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    parsed = resume_data.get("parsed_data", {})
    skills = [s.lower() for s in parsed.get("skills", [])]
    experience = parsed.get("experience", [])
    suggestions = []
    if any(s in skills for s in ["python", "java", "javascript", "typescript"]):
        suggestions.append({
            "type": "career_path",
            "title": "Software Engineering",
            "description": "Your programming skills qualify you for software engineering roles. Consider specializing in full-stack, backend, or systems engineering.",
        })
    if any(s in skills for s in ["machine learning", "deep learning", "tensorflow", "pytorch"]):
        suggestions.append({
            "type": "career_path",
            "title": "Data Science / ML Engineering",
            "description": "Your ML skills position you well for data science or machine learning engineering roles.",
        })
    if any(s in skills for s in ["aws", "azure", "gcp", "docker", "kubernetes"]):
        suggestions.append({
            "type": "career_path",
            "title": "Cloud / DevOps Engineering",
            "description": "Your cloud and DevOps skills are in high demand. Consider pursuing cloud architecture roles.",
        })
    if any(s in skills for s in ["react", "vue", "angular", "css", "html"]):
        suggestions.append({
            "type": "career_path",
            "title": "Frontend / UI Engineering",
            "description": "Your frontend skills make you a strong candidate for UI/UX engineering positions.",
        })
    if len(experience) > 5:
        suggestions.append({
            "type": "advancement",
            "title": "Consider Leadership Roles",
            "description": "With extensive experience, consider moving into tech lead, architect, or engineering manager positions.",
        })
    if not suggestions:
        suggestions.append({
            "type": "general",
            "title": "Continue Building Skills",
            "description": "Focus on in-demand skills in your field. Consider adding cloud, containerization, or modern frameworks to your toolkit.",
        })
    return suggestions
