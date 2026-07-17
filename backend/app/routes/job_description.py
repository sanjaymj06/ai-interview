from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import get_current_user
from app.models.job_description import ExtractedData, JobDescriptionCreate, JobDescriptionResponse
from app.services.nlp_processor import extract_skills_nlp, extract_keywords_tfidf
from app.utils.constants import ERROR_MESSAGES, SUCCESS_MESSAGES

router = APIRouter(prefix="/api/job-description", tags=["Job Description"])


def _jd_response(jd: dict) -> JobDescriptionResponse:
    extracted = jd.get("extracted_data")
    if extracted and isinstance(extracted, dict):
        extracted = ExtractedData(**extracted)
    return JobDescriptionResponse(
        id=str(jd["_id"]),
        user_id=str(jd["user_id"]),
        title=jd["title"],
        company=jd.get("company"),
        raw_text=jd["raw_text"],
        extracted_data=extracted,
        location=jd.get("location"),
        salary_range=jd.get("salary_range"),
        employment_type=jd.get("employment_type"),
        created_at=jd.get("created_at", datetime.utcnow()),
        updated_at=jd.get("updated_at", datetime.utcnow()),
    )


def _extract_jd_data(raw_text: str) -> dict:
    skills = extract_skills_nlp(raw_text)
    keywords = [kw for kw, _ in extract_keywords_tfidf(raw_text, top_n=30)]
    import re
    years_pattern = r"(\d+)\+?\s*(?:years?|yrs?)"
    years_match = re.search(years_pattern, raw_text.lower())
    experience_years = int(years_match.group(1)) if years_match else None
    return {
        "required_skills": skills[:15],
        "preferred_skills": skills[15:25],
        "education_requirements": [],
        "experience_years": experience_years,
        "responsibilities": [],
        "keywords": keywords,
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    body: JobDescriptionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    extracted_data = _extract_jd_data(body.raw_text)
    now = datetime.utcnow()
    jd_doc = {
        "user_id": str(current_user["_id"]),
        "title": body.title,
        "company": body.company,
        "raw_text": body.raw_text,
        "extracted_data": extracted_data,
        "location": body.location,
        "salary_range": body.salary_range,
        "employment_type": body.employment_type,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.job_descriptions.insert_one(jd_doc)
    jd_doc["_id"] = result.inserted_id
    return {
        "message": SUCCESS_MESSAGES["JD_CREATED"],
        "job_description": _jd_response(jd_doc).model_dump(),
    }


@router.get("/list", response_model=dict)
async def list_job_descriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])
    total = await db.job_descriptions.count_documents({"user_id": user_id})
    cursor = db.job_descriptions.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    jds = []
    async for jd in cursor:
        jds.append(_jd_response(jd).model_dump())
    return {
        "job_descriptions": jds,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{jd_id}", response_model=dict)
async def get_job_description(
    jd_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    jd = await db.job_descriptions.find_one({"_id": jd_id, "user_id": str(current_user["_id"])})
    if not jd:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["JD_NOT_FOUND"])
    return {"job_description": _jd_response(jd).model_dump()}


@router.delete("/{jd_id}", response_model=dict)
async def delete_job_description(
    jd_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    jd = await db.job_descriptions.find_one({"_id": jd_id, "user_id": str(current_user["_id"])})
    if not jd:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["JD_NOT_FOUND"])
    await db.job_descriptions.delete_one({"_id": jd_id})
    await db.analyses.delete_many({"job_description_id": jd_id})
    return {"message": SUCCESS_MESSAGES["JD_DELETED"]}
