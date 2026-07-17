from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import get_current_user
from app.models.analysis import AnalysisCreate, AnalysisResponse, ScoreBreakdown
from app.services.ai_suggester import generate_improvement_suggestions
from app.services.ats_scorer import run_analysis as run_ats_analysis
from app.services.pdf_exporter import export_analysis_to_pdf
from app.services.report_generator import generate_chart_data, generate_report
from app.utils.constants import ERROR_MESSAGES, SUCCESS_MESSAGES

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


def _analysis_response(analysis: dict) -> AnalysisResponse:
    breakdown = analysis.get("score_breakdown", {})
    if isinstance(breakdown, dict):
        breakdown = ScoreBreakdown(**breakdown)
    return AnalysisResponse(
        id=str(analysis["_id"]),
        user_id=str(analysis["user_id"]),
        resume_id=str(analysis["resume_id"]),
        job_description_id=str(analysis["job_description_id"]),
        ats_score=analysis.get("ats_score", 0.0),
        score_breakdown=breakdown,
        missing_skills=analysis.get("missing_skills", []),
        extra_skills=analysis.get("extra_skills", []),
        strengths=analysis.get("strengths", []),
        weaknesses=analysis.get("weaknesses", []),
        suggestions=analysis.get("suggestions", []),
        created_at=analysis.get("created_at", datetime.utcnow()),
    )


@router.post("/run", response_model=dict, status_code=status.HTTP_201_CREATED)
async def run_analysis(
    body: AnalysisCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    resume = await db.resumes.find_one({
        "_id": body.resume_id,
        "user_id": str(current_user["_id"]),
    })
    if not resume:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["RESUME_NOT_FOUND"])

    jd = await db.job_descriptions.find_one({
        "_id": body.job_description_id,
        "user_id": str(current_user["_id"]),
    })
    if not jd:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["JD_NOT_FOUND"])

    resume_data = {
        "raw_text": resume.get("raw_text", ""),
        "cleaned_text": resume.get("raw_text", ""),
        "parsed_data": resume.get("parsed_data", {}),
        "filename": resume.get("filename", ""),
    }
    job_data = {
        "raw_text": jd.get("raw_text", ""),
        "extracted_data": jd.get("extracted_data", {}),
        "title": jd.get("title", ""),
        "company": jd.get("company"),
    }

    try:
        analysis_result = run_ats_analysis(resume_data, job_data)
        suggestions = generate_improvement_suggestions(analysis_result, resume_data, job_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{ERROR_MESSAGES['PROCESSING_ERROR']}: {str(e)}")

    now = datetime.utcnow()
    analysis_doc = {
        "user_id": str(current_user["_id"]),
        "resume_id": body.resume_id,
        "job_description_id": body.job_description_id,
        "ats_score": analysis_result["ats_score"],
        "score_breakdown": analysis_result["score_breakdown"],
        "missing_skills": analysis_result["missing_skills"],
        "extra_skills": analysis_result["extra_skills"],
        "strengths": analysis_result["strengths"],
        "weaknesses": analysis_result["weaknesses"],
        "suggestions": suggestions,
        "created_at": now,
    }
    result = await db.analyses.insert_one(analysis_doc)
    analysis_doc["_id"] = result.inserted_id

    return {
        "message": SUCCESS_MESSAGES["ANALYSIS_COMPLETE"],
        "analysis": _analysis_response(analysis_doc).model_dump(),
    }


@router.get("/history", response_model=dict)
async def get_analysis_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])
    total = await db.analyses.count_documents({"user_id": user_id})
    cursor = db.analyses.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    analyses = []
    async for analysis in cursor:
        analyses.append(_analysis_response(analysis).model_dump())
    return {
        "analyses": analyses,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{analysis_id}", response_model=dict)
async def get_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    analysis = await db.analyses.find_one({
        "_id": analysis_id,
        "user_id": str(current_user["_id"]),
    })
    if not analysis:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["ANALYSIS_NOT_FOUND"])
    return {"analysis": _analysis_response(analysis).model_dump()}


@router.get("/{analysis_id}/report", response_model=dict)
async def get_report(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    analysis = await db.analyses.find_one({
        "_id": analysis_id,
        "user_id": str(current_user["_id"]),
    })
    if not analysis:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["ANALYSIS_NOT_FOUND"])

    resume = await db.resumes.find_one({"_id": analysis["resume_id"]})
    jd = await db.job_descriptions.find_one({"_id": analysis["job_description_id"]})

    resume_data = {
        "raw_text": resume.get("raw_text", "") if resume else "",
        "parsed_data": resume.get("parsed_data", {}) if resume else {},
        "filename": resume.get("filename", "") if resume else "",
    }
    job_data = {
        "raw_text": jd.get("raw_text", "") if jd else "",
        "extracted_data": jd.get("extracted_data", {}) if jd else {},
        "title": jd.get("title", "") if jd else "",
        "company": jd.get("company") if jd else None,
    }

    report = generate_report(
        {
            "id": analysis_id,
            "user_id": str(current_user["_id"]),
            "ats_score": analysis.get("ats_score", 0),
            "score_breakdown": analysis.get("score_breakdown", {}),
            "missing_skills": analysis.get("missing_skills", []),
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "suggestions": analysis.get("suggestions", []),
        },
        resume_data,
        job_data,
    )
    chart_data = generate_chart_data({
        "score_breakdown": analysis.get("score_breakdown", {}),
    })

    return {
        "report": report.model_dump(),
        "chart_data": chart_data,
    }


@router.get("/{analysis_id}/export")
async def export_report(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    analysis = await db.analyses.find_one({
        "_id": analysis_id,
        "user_id": str(current_user["_id"]),
    })
    if not analysis:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["ANALYSIS_NOT_FOUND"])

    resume = await db.resumes.find_one({"_id": analysis["resume_id"]})
    jd = await db.job_descriptions.find_one({"_id": analysis["job_description_id"]})

    resume_data = {
        "raw_text": resume.get("raw_text", "") if resume else "",
        "parsed_data": resume.get("parsed_data", {}) if resume else {},
        "filename": resume.get("filename", "") if resume else "",
    }
    job_data = {
        "raw_text": jd.get("raw_text", "") if jd else "",
        "extracted_data": jd.get("extracted_data", {}) if jd else {},
        "title": jd.get("title", "") if jd else "",
        "company": jd.get("company") if jd else None,
    }

    try:
        pdf_path = export_analysis_to_pdf(
            {
                "id": analysis_id,
                "user_id": str(current_user["_id"]),
                "ats_score": analysis.get("ats_score", 0),
                "score_breakdown": analysis.get("score_breakdown", {}),
                "missing_skills": analysis.get("missing_skills", []),
                "strengths": analysis.get("strengths", []),
                "weaknesses": analysis.get("weaknesses", []),
                "suggestions": analysis.get("suggestions", []),
            },
            resume_data,
            job_data,
        )
        from fastapi.responses import FileResponse
        return FileResponse(
            path=pdf_path,
            filename=f"resume_analysis_report_{analysis_id[:8]}.pdf",
            media_type="application/pdf",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
