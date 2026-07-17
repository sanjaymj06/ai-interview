from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ReportSection(BaseModel):
    title: str
    content: Any
    score: Optional[float] = None


class ReportCreate(BaseModel):
    analysis_id: str


class ReportResponse(BaseModel):
    id: str
    analysis_id: str
    user_id: str
    resume_filename: str
    job_title: str
    company: Optional[str] = None
    overall_score: float
    sections: List[ReportSection] = Field(default_factory=list)
    summary: str = ""
    generated_at: datetime
