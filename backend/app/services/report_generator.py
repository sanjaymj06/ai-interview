from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.report import ReportSection, ReportResponse
from app.utils.constants import SCORING_WEIGHTS


def generate_report(
    analysis_data: Dict[str, Any],
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
) -> ReportResponse:
    parsed = resume_data.get("parsed_data", {})
    breakdown = analysis_data.get("score_breakdown", {})
    missing_skills = analysis_data.get("missing_skills", [])
    strengths = analysis_data.get("strengths", [])
    weaknesses = analysis_data.get("weaknesses", [])
    suggestions = analysis_data.get("suggestions", [])
    ats_score = analysis_data.get("ats_score", 0.0)

    sections: List[ReportSection] = []

    overview_score = ats_score
    if ats_score >= 80:
        overview_content = "Your resume is well-optimized for this position. Strong alignment with the job requirements."
    elif ats_score >= 60:
        overview_content = "Your resume shows good alignment but has room for improvement. Focus on the suggestions below."
    elif ats_score >= 40:
        overview_content = "Your resume needs moderate improvements to better match this job description."
    else:
        overview_content = "Your resume requires significant optimization to match this position's requirements."
    sections.append(ReportSection(title="Overview", content=overview_content, score=overview_score))

    skill_section_content = {
        "matched_skills": [s for s in parsed.get("skills", []) if s.lower() not in [m.lower() for m in missing_skills]],
        "missing_skills": missing_skills,
        "total_resume_skills": len(parsed.get("skills", [])),
    }
    sections.append(ReportSection(
        title="Skills Analysis",
        content=skill_section_content,
        score=breakdown.get("skill_match", 0.0),
    ))

    keyword_content = {
        "keyword_match_score": breakdown.get("keyword_match", 0.0),
        "missing_keywords": missing_skills[:10],
        "recommendation": "Incorporate missing keywords naturally throughout your resume, especially in the summary and experience sections.",
    }
    sections.append(ReportSection(
        title="Keyword Optimization",
        content=keyword_content,
        score=breakdown.get("keyword_match", 0.0),
    ))

    experience_content = {
        "experience_match_score": breakdown.get("experience_match", 0.0),
        "experience_entries": len(parsed.get("experience", [])),
        "recommendation": "Ensure your experience descriptions include quantifiable achievements and relevant keywords.",
    }
    sections.append(ReportSection(
        title="Experience Assessment",
        content=experience_content,
        score=breakdown.get("experience_match", 0.0),
    ))

    education_content = {
        "education_match_score": breakdown.get("education_match", 0.0),
        "education_entries": len(parsed.get("education", [])),
        "recommendation": "List your highest relevant degree prominently. Include GPA if above 3.5.",
    }
    sections.append(ReportSection(
        title="Education Assessment",
        content=education_content,
        score=breakdown.get("education_match", 0.0),
    ))

    project_content = {
        "project_match_score": breakdown.get("project_match", 0.0),
        "project_count": len(parsed.get("projects", [])),
        "recommendation": "Highlight projects that demonstrate skills relevant to the job description.",
    }
    sections.append(ReportSection(
        title="Projects Assessment",
        content=project_content,
        score=breakdown.get("project_match", 0.0),
    ))

    cert_content = {
        "certification_match_score": breakdown.get("certification_match", 0.0),
        "certification_count": len(parsed.get("certifications", [])),
        "recommendation": "Add industry-recognized certifications to strengthen your profile.",
    }
    sections.append(ReportSection(
        title="Certifications Assessment",
        content=cert_content,
        score=breakdown.get("certification_match", 0.0),
    ))

    sections.append(ReportSection(title="Strengths", content=strengths))
    sections.append(ReportSection(title="Weaknesses", content=weaknesses))
    sections.append(ReportSection(title="Suggestions", content=suggestions))

    summary_text = f"Overall ATS Score: {ats_score}/100. "
    if strengths:
        summary_text += f"Key strengths: {strengths[0]}. "
    if weaknesses:
        summary_text += f"Main area to improve: {weaknesses[0]}. "
    high_priority = [s for s in suggestions if s.get("priority") == "high"]
    if high_priority:
        summary_text += f"Top recommendation: {high_priority[0].get('title', '')}."

    report_id = f"report_{analysis_data.get('id', 'unknown')}_{int(datetime.utcnow().timestamp())}"

    return ReportResponse(
        id=report_id,
        analysis_id=analysis_data.get("id", ""),
        user_id=analysis_data.get("user_id", ""),
        resume_filename=resume_data.get("filename", "unknown"),
        job_title=job_data.get("title", "Unknown Position"),
        company=job_data.get("company"),
        overall_score=ats_score,
        sections=sections,
        summary=summary_text,
        generated_at=datetime.utcnow(),
    )


def generate_section_scores_summary(breakdown: Dict[str, float]) -> Dict[str, Any]:
    weighted_scores = {}
    for key, weight in SCORING_WEIGHTS.items():
        raw = breakdown.get(key, 0.0)
        weighted_scores[key] = {
            "raw_score": round(raw, 2),
            "weight": weight,
            "weighted_score": round(raw * weight, 2),
        }
    return weighted_scores


def generate_chart_data(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    breakdown = analysis_data.get("score_breakdown", {})
    labels = ["Keywords", "Skills", "Experience", "Education", "Projects", "Certifications"]
    keys = ["keyword_match", "skill_match", "experience_match", "education_match", "project_match", "certification_match"]
    values = [breakdown.get(k, 0.0) for k in keys]
    return {
        "labels": labels,
        "values": values,
        "colors": _get_score_colors(values),
    }


def _get_score_colors(values: List[float]) -> List[str]:
    colors = []
    for v in values:
        if v >= 80:
            colors.append("#22c55e")
        elif v >= 60:
            colors.append("#eab308")
        elif v >= 40:
            colors.append("#f97316")
        else:
            colors.append("#ef4444")
    return colors
