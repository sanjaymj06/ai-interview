from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=dict)
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])
    total_resumes = await db.resumes.count_documents({"user_id": user_id})
    total_analyses = await db.analyses.count_documents({"user_id": user_id})

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$ats_score"}}},
    ]
    avg_result = await db.analyses.aggregate(pipeline).to_list(length=1)
    avg_score = round(avg_result[0]["avg_score"], 2) if avg_result else 0.0

    best_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"ats_score": -1}},
        {"$limit": 1},
    ]
    best_result = await db.analyses.aggregate(best_pipeline).to_list(length=1)
    best_score = round(best_result[0]["ats_score"], 2) if best_result else 0.0

    return {
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "average_score": avg_score,
        "best_score": best_score,
    }


@router.get("/charts", response_model=dict)
async def get_charts(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])

    skill_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$unwind": "$parsed_data.skills"},
        {"$group": {"_id": "$parsed_data.skills", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    skill_cursor = db.resumes.aggregate(skill_pipeline)
    skill_data = []
    async for doc in skill_cursor:
        skill_data.append({"skill": doc["_id"], "count": doc["count"]})

    score_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "keyword_match": {"$avg": "$score_breakdown.keyword_match"},
            "skill_match": {"$avg": "$score_breakdown.skill_match"},
            "experience_match": {"$avg": "$score_breakdown.experience_match"},
            "education_match": {"$avg": "$score_breakdown.education_match"},
            "project_match": {"$avg": "$score_breakdown.project_match"},
            "certification_match": {"$avg": "$score_breakdown.certification_match"},
        }},
    ]
    score_cursor = db.analyses.aggregate(score_pipeline)
    score_data = {"keyword_match": 0, "skill_match": 0, "experience_match": 0,
                  "education_match": 0, "project_match": 0, "certification_match": 0}
    async for doc in score_cursor:
        score_data = {
            "keyword_match": round(doc.get("keyword_match", 0), 2),
            "skill_match": round(doc.get("skill_match", 0), 2),
            "experience_match": round(doc.get("experience_match", 0), 2),
            "education_match": round(doc.get("education_match", 0), 2),
            "project_match": round(doc.get("project_match", 0), 2),
            "certification_match": round(doc.get("certification_match", 0), 2),
        }

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    trend_pipeline = [
        {"$match": {"user_id": user_id, "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "avg_score": {"$avg": "$ats_score"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    trend_cursor = db.analyses.aggregate(trend_pipeline)
    trend_data = []
    async for doc in trend_cursor:
        trend_data.append({
            "date": doc["_id"],
            "avg_score": round(doc["avg_score"], 2),
            "count": doc["count"],
        })

    return {
        "skill_distribution": skill_data,
        "score_breakdown": score_data,
        "analysis_trends": trend_data,
    }


@router.get("/recent", response_model=dict)
async def get_recent(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user_id = str(current_user["_id"])
    cursor = db.analyses.find({"user_id": user_id}).sort("created_at", -1).limit(10)
    recent = []
    async for analysis in cursor:
        resume = await db.resumes.find_one({"_id": analysis.get("resume_id")})
        jd = await db.job_descriptions.find_one({"_id": analysis.get("job_description_id")})
        recent.append({
            "id": str(analysis["_id"]),
            "resume_filename": resume.get("filename", "Unknown") if resume else "Deleted",
            "job_title": jd.get("title", "Unknown") if jd else "Deleted",
            "ats_score": analysis.get("ats_score", 0),
            "created_at": analysis.get("created_at", datetime.utcnow()).isoformat(),
        })
    return {"recent": recent}
