import os
import shutil
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.database import get_database
from app.middleware.auth import get_current_user
from app.models.resume import ParsedSection, ResumeResponse
from app.services.resume_parser import parse_resume
from app.utils.constants import ERROR_MESSAGES, SUCCESS_MESSAGES
from app.utils.helpers import sanitize_filename, validate_file_type
from app.utils.validators import validate_file

router = APIRouter(prefix="/api/resume", tags=["Resume"])


def _resume_response(resume: dict) -> ResumeResponse:
    parsed = resume.get("parsed_data")
    if parsed and isinstance(parsed, dict):
        parsed = ParsedSection(**parsed)
    return ResumeResponse(
        id=str(resume["_id"]),
        user_id=str(resume["user_id"]),
        filename=resume["filename"],
        file_path=resume.get("file_path", ""),
        raw_text=resume.get("raw_text", ""),
        parsed_data=parsed,
        file_size=resume.get("file_size", 0),
        page_count=resume.get("page_count", 0),
        created_at=resume.get("created_at", datetime.utcnow()),
        updated_at=resume.get("updated_at", datetime.utcnow()),
    )


@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    if not validate_file_type(file.filename):
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES["INVALID_FILE_TYPE"])
    content = await file.read()
    file_size = len(content)
    valid, error_msg = validate_file(
        file.filename, file_size, settings.max_file_size_bytes, settings.allowed_file_types_list
    )
    if not valid:
        raise HTTPException(status_code=400, detail=error_msg)
    safe_name = sanitize_filename(file.filename)
    unique_name = f"{current_user['_id']}_{int(datetime.utcnow().timestamp())}_{safe_name}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)
    try:
        parsed_result = parse_resume(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"{ERROR_MESSAGES['PARSING_ERROR']}: {str(e)}")
    now = datetime.utcnow()
    resume_doc = {
        "user_id": str(current_user["_id"]),
        "filename": file.filename,
        "file_path": file_path,
        "raw_text": parsed_result.get("raw_text", ""),
        "parsed_data": parsed_result.get("parsed_data"),
        "file_size": file_size,
        "page_count": parsed_result.get("page_count", 0),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.resumes.insert_one(resume_doc)
    resume_doc["_id"] = result.inserted_id
    return {
        "message": SUCCESS_MESSAGES["RESUME_UPLOADED"],
        "resume": _resume_response(resume_doc).model_dump(),
    }


@router.get("/list", response_model=dict)
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])
    total = await db.resumes.count_documents({"user_id": user_id})
    cursor = db.resumes.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    resumes = []
    async for resume in cursor:
        resumes.append(_resume_response(resume).model_dump())
    return {
        "resumes": resumes,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{resume_id}", response_model=dict)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    resume = await db.resumes.find_one({"_id": resume_id, "user_id": str(current_user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["RESUME_NOT_FOUND"])
    return {"resume": _resume_response(resume).model_dump()}


@router.delete("/{resume_id}", response_model=dict)
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    resume = await db.resumes.find_one({"_id": resume_id, "user_id": str(current_user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["RESUME_NOT_FOUND"])
    file_path = resume.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    await db.resumes.delete_one({"_id": resume_id})
    await db.analyses.delete_many({"resume_id": resume_id})
    return {"message": SUCCESS_MESSAGES["RESUME_DELETED"]}


@router.get("/{resume_id}/parsed", response_model=dict)
async def get_parsed_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    resume = await db.resumes.find_one({"_id": resume_id, "user_id": str(current_user["_id"])})
    if not resume:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["RESUME_NOT_FOUND"])
    return {
        "resume_id": str(resume["_id"]),
        "filename": resume["filename"],
        "parsed_data": resume.get("parsed_data"),
        "raw_text": resume.get("raw_text", ""),
    }
