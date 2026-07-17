from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import require_admin
from app.utils.constants import ERROR_MESSAGES

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=dict)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]
    total = await db.users.count_documents(query)
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = []
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user.get("role", "user"),
            "status": user.get("status", "active"),
            "created_at": user.get("created_at", datetime.utcnow()).isoformat(),
        })
    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.put("/users/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    role: str = Query(None),
    is_active: bool = Query(None),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
    update_fields = {"updated_at": datetime.utcnow()}
    if role is not None:
        if role not in ("user", "admin"):
            raise HTTPException(status_code=400, detail="Invalid role")
        update_fields["role"] = role
    if is_active is not None:
        update_fields["status"] = "active" if is_active else "inactive"
    await db.users.update_one({"_id": user_id}, {"$set": update_fields})
    return {"message": "User updated successfully"}


@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
    if user_id == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"status": "deleted", "updated_at": datetime.utcnow()}},
    )
    return {"message": "User deleted successfully"}


@router.get("/analytics", response_model=dict)
async def get_analytics(
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    total_users = await db.users.count_documents({"status": {"$ne": "deleted"}})
    total_resumes = await db.resumes.count_documents({})
    total_analyses = await db.analyses.count_documents({})

    avg_pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$ats_score"}}},
    ]
    avg_result = await db.analyses.aggregate(avg_pipeline).to_list(length=1)
    avg_score = round(avg_result[0]["avg_score"], 2) if avg_result else 0.0

    thirty_days_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    user_growth_pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    user_growth_cursor = db.users.aggregate(user_growth_pipeline)
    user_growth = []
    async for doc in user_growth_cursor:
        user_growth.append({"date": doc["_id"], "count": doc["count"]})

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "average_score": avg_score,
        "user_growth": user_growth,
    }


@router.get("/logs", response_model=dict)
async def get_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    total = await db.activity_logs.count_documents({}) if "activity_logs" in await db.list_collection_names() else 0
    logs = []
    if total > 0:
        cursor = db.activity_logs.find().sort("created_at", -1).skip(skip).limit(limit)
        async for log in cursor:
            logs.append({
                "id": str(log["_id"]),
                "action": log.get("action", ""),
                "user_id": log.get("user_id", ""),
                "details": log.get("details", {}),
                "ip_address": log.get("ip_address", ""),
                "created_at": log.get("created_at", datetime.utcnow()).isoformat(),
            })
    return {
        "logs": logs,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/export-reports", response_model=dict)
async def export_reports(
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    cursor = db.analyses.find({}).sort("created_at", -1).limit(1000)
    reports = []
    async for analysis in cursor:
        resume = await db.resumes.find_one({"_id": analysis.get("resume_id")})
        jd = await db.job_descriptions.find_one({"_id": analysis.get("job_description_id")})
        user = await db.users.find_one({"_id": analysis.get("user_id")})
        reports.append({
            "analysis_id": str(analysis["_id"]),
            "user_email": user.get("email", "Unknown") if user else "Unknown",
            "resume_filename": resume.get("filename", "Unknown") if resume else "Deleted",
            "job_title": jd.get("title", "Unknown") if jd else "Deleted",
            "ats_score": analysis.get("ats_score", 0),
            "created_at": analysis.get("created_at", datetime.utcnow()).isoformat(),
        })
    return {
        "reports": reports,
        "total": len(reports),
    }
