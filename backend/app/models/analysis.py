from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalysisCreate(BaseModel):
    resume_id: str
    job_description_id: str


class ScoreBreakdown(BaseModel):
    keyword_match: float = 0.0
    skill_match: float = 0.0
    experience_match: float = 0.0
    education_match: float = 0.0
    project_match: float = 0.0
    certification_match: float = 0.0


class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_description_id: str
    ats_score: float
    score_breakdown: ScoreBreakdown
    missing_skills: List[str] = Field(default_factory=list)
    extra_skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime


class AnalysisInDB(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_description_id: str
    ats_score: float = 0.0
    score_breakdown: Dict[str, float] = Field(default_factory=dict)
    missing_skills: List[str] = Field(default_factory=list)
    extra_skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
