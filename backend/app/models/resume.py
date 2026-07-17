from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ParsedSection(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[Dict[str, Any]] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)


class ResumeCreate(BaseModel):
    filename: str
    raw_text: str = ""
    parsed_data: Optional[ParsedSection] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_path: str
    raw_text: str
    parsed_data: Optional[ParsedSection] = None
    file_size: int = 0
    page_count: int = 0
    created_at: datetime
    updated_at: datetime


class ResumeInDB(BaseModel):
    id: str
    user_id: str
    filename: str
    file_path: str
    raw_text: str = ""
    parsed_data: Optional[Dict[str, Any]] = None
    file_size: int = 0
    page_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    user_id: str
    ats_score: float
    keyword_match: float
    skill_match: float
    experience_match: float
    education_match: float
    project_match: float
    certification_match: float
    missing_skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
