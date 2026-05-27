# student/models.py
from pydantic import BaseModel
from typing import Dict, List

class ProgressResponse(BaseModel):
    student_id: str
    term: str
    marks: Dict[str, float]
    attendance_pct: float
    uploaded_at: str

class PredictionResponse(BaseModel):
    prediction_label: str
    confidence_score: float
    model_version: str
    generated_at: str

class HistoryItem(BaseModel):
    prediction_label: str
    confidence_score: float
    generated_at: str
