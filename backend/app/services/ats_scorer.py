import re
from typing import Any, Dict, List, Optional, Tuple

from app.services.nlp_processor import (
    extract_keywords_tfidf,
    extract_skills_nlp,
    calculate_text_similarity,
)
from app.utils.constants import SCORING_WEIGHTS


def calculate_keyword_match(
    resume_text: str, jd_text: str, jd_keywords: Optional[List[str]] = None
) -> Tuple[float, List[str]]:
    if jd_keywords is None:
        jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=30)]
    resume_lower = resume_text.lower()
    matched = [kw for kw in jd_keywords if kw.lower() in resume_lower]
    if not jd_keywords:
        return 0.0, []
    score = (len(matched) / len(jd_keywords)) * 100
    return min(score, 100.0), [kw for kw in jd_keywords if kw.lower() not in resume_lower]


def calculate_skill_match(
    resume_skills: List[str], jd_skills: List[str]
) -> Tuple[float, List[str], List[str]]:
    if not jd_skills:
        return 100.0, [], resume_skills
    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)
    matched = resume_set & jd_set
    missing = list(jd_set - resume_set)
    extra = list(resume_set - jd_set)
    if not jd_set:
        return 100.0, [], extra
    score = (len(matched) / len(jd_set)) * 100
    return min(score, 100.0), missing, extra


def calculate_experience_match(
    resume_experience: List[Dict[str, Any]], jd_text: str
) -> float:
    years_pattern = r"(\d+)\+?\s*(?:years?|yrs?)"
    match = re.search(years_pattern, jd_text.lower())
    required_years = int(match.group(1)) if match else 0
    if required_years == 0:
        return 100.0
    total_years = 0
    for exp in resume_experience:
        period = exp.get("period", "")
        year_matches = re.findall(r"(19|20)\d{2}", period)
        if len(year_matches) == 2:
            start, end = int(year_matches[0]), int(year_matches[1])
            total_years += max(0, end - start)
        elif len(year_matches) == 1:
            total_years += 1
    if total_years >= required_years:
        return 100.0
    score = (total_years / required_years) * 100 if required_years > 0 else 100.0
    return min(score, 100.0)


def calculate_education_match(
    resume_education: List[Dict[str, Any]], jd_text: str
) -> float:
    degree_levels = {
        "high school": 1,
        "associate": 2,
        "diploma": 2,
        "bachelor": 3,
        "b.s.": 3, "b.a.": 3, "b.e.": 3, "b.tech": 3,
        "master": 4,
        "m.s.": 4, "m.a.": 4, "m.e.": 4, "m.tech": 4, "mba": 4,
        "phd": 5, "ph.d.": 5, "doctorate": 5, "doctoral": 5,
    }
    required_level = 0
    jd_lower = jd_text.lower()
    for degree, level in degree_levels.items():
        if degree in jd_lower:
            required_level = max(required_level, level)
    if required_level == 0:
        return 100.0
    max_resume_level = 0
    for edu in resume_education:
        degree_text = edu.get("degree", "").lower()
        raw_text = edu.get("raw", "").lower()
        combined = f"{degree_text} {raw_text}"
        for degree, level in degree_levels.items():
            if degree in combined:
                max_resume_level = max(max_resume_level, level)
    if max_resume_level >= required_level:
        return 100.0
    if max_resume_level == 0:
        return 50.0
    score = (max_resume_level / required_level) * 100
    return min(score, 100.0)


def calculate_project_match(
    resume_projects: List[Dict[str, Any]], jd_text: str
) -> float:
    if not resume_projects:
        return 30.0
    jd_keywords = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=15)]
    project_texts = []
    for proj in resume_projects:
        parts = [proj.get("name", "")]
        parts.extend(proj.get("description", []))
        project_texts.append(" ".join(parts).lower())
    combined_projects = " ".join(project_texts)
    if not jd_keywords:
        return 70.0
    matched = sum(1 for kw in jd_keywords if kw.lower() in combined_projects)
    score = (matched / len(jd_keywords)) * 100 if jd_keywords else 0
    return min(max(score, 20.0), 100.0)


def calculate_certification_match(
    resume_certs: List[Dict[str, Any]], jd_text: str
) -> float:
    if not resume_certs:
        return 40.0
    cert_keywords = ["certification", "certified", "license", "credential"]
    jd_lower = jd_text.lower()
    needs_certs = any(kw in jd_lower for kw in cert_keywords)
    if not needs_certs:
        return 100.0
    cert_texts = " ".join(c.get("name", "").lower() for c in resume_certs)
    matching_certs = sum(1 for kw in cert_keywords if kw in cert_texts)
    if matching_certs > 0:
        return 100.0
    return 50.0


def find_strengths(
    keyword_match: float,
    skill_match: float,
    experience_match: float,
    education_match: float,
    project_match: float,
    certification_match: float,
    resume_text: str,
    parsed_data: Dict[str, Any],
) -> List[str]:
    strengths = []
    if keyword_match >= 80:
        strengths.append("Strong keyword alignment with the job description")
    if skill_match >= 80:
        strengths.append("Excellent skill match for the position")
    if experience_match >= 80:
        strengths.append("Experience level meets or exceeds requirements")
    if education_match >= 80:
        strengths.append("Education qualifications match requirements")
    if project_match >= 70:
        strengths.append("Relevant project experience demonstrated")
    if certification_match >= 80:
        strengths.append("Strong certification profile")
    if parsed_data.get("linkedin_url"):
        strengths.append("Professional LinkedIn profile included")
    if parsed_data.get("github_url"):
        strengths.append("GitHub profile showcasing technical work")
    if len(parsed_data.get("skills", [])) > 10:
        strengths.append("Comprehensive skill set demonstrated")
    if len(parsed_data.get("experience", [])) > 2:
        strengths.append("Substantial work experience history")
    if len(parsed_data.get("projects", [])) > 2:
        strengths.append("Multiple project contributions documented")
    if not strengths:
        strengths.append("Document structure is clear and readable")
    return strengths


def run_analysis(
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> Dict[str, Any]:
    resume_text = resume_data.get("cleaned_text", resume_data.get("raw_text", ""))
    jd_text = job_data.get("raw_text", "")
    parsed = resume_data.get("parsed_data", {})
    extracted = job_data.get("extracted_data", {})
    resume_skills = parsed.get("skills", [])
    jd_skills = extracted.get("required_skills", []) + extracted.get("preferred_skills", [])
    jd_keywords = extracted.get("keywords", [])
    if not jd_keywords:
        jd_keywords_list = [kw for kw, _ in extract_keywords_tfidf(jd_text, top_n=30)]
        jd_keywords = jd_keywords_list
    keyword_match, missing_keywords = calculate_keyword_match(resume_text, jd_text, jd_keywords)
    skill_match, missing_skills, extra_skills = calculate_skill_match(resume_skills, jd_skills)
    experience_match = calculate_experience_match(parsed.get("experience", []), jd_text)
    education_match = calculate_education_match(parsed.get("education", []), jd_text)
    project_match = calculate_project_match(parsed.get("projects", []), jd_text)
    certification_match = calculate_certification_match(parsed.get("certifications", []), jd_text)

    scores = {
        "keyword_match": keyword_match,
        "skill_match": skill_match,
        "experience_match": experience_match,
        "education_match": education_match,
        "project_match": project_match,
        "certification_match": certification_match,
    }
    ats_score = sum(
        scores[k] * SCORING_WEIGHTS[k] for k in SCORING_WEIGHTS
    )
    ats_score = round(min(max(ats_score, 0), 100), 2)

    weaknesses = []
    if keyword_match < 60:
        weaknesses.append("Low keyword match - resume may not pass ATS screening")
    if skill_match < 60:
        weaknesses.append("Missing key skills required for the position")
    if experience_match < 60:
        weaknesses.append("Insufficient experience for the role")
    if education_match < 60:
        weaknesses.append("Education level may not meet requirements")
    if project_match < 50:
        weaknesses.append("Limited relevant project experience")
    if certification_match < 50:
        weaknesses.append("Missing recommended certifications")

    strengths = find_strengths(
        keyword_match, skill_match, experience_match,
        education_match, project_match, certification_match,
        resume_text, parsed,
    )

    return {
        "ats_score": ats_score,
        "score_breakdown": scores,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "strengths": strengths,
        "weaknesses": weaknesses,
    }
