# prediction/models.py
from pydantic import BaseModel
from typing import Optional

class PredictionResult(BaseModel):
    prediction_id: str          
    student_id: str
    prediction_label: str
    confidence_score: float
    model_version: str
    generated_at: str
    academic_record_id: Optional[str] = None