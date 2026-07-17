from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class JobDescriptionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    raw_text: str = Field(..., min_length=10)
    location: Optional[str] = None
    salary_range: Optional[str] = None
    employment_type: Optional[str] = None


class ExtractedData(BaseModel):
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    responsibilities: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)


class JobDescriptionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    raw_text: str
    extracted_data: Optional[ExtractedData] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    employment_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobDescriptionInDB(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    raw_text: str
    extracted_data: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    employment_type: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
