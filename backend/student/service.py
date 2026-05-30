# student/service.py
from fastapi import HTTPException
from typing import List
from student.models import ProgressResponse, PredictionResponse, HistoryItem
from student.repository import get_latest_academic_record
from prediction.service import get_latest_prediction, get_prediction_history

def fetch_progress(student_id: str) -> ProgressResponse:
    record = get_latest_academic_record(student_id)
    if not record:
        raise HTTPException(status_code=404, detail="No academic record found for this student")
    return ProgressResponse(
        student_id=record["student_id"],
        term=record["term"],
        marks=record["marks"],
        attendance_pct=record["attendance_pct"],
        uploaded_at=record["uploaded_at"],
    )

def fetch_prediction(student_id: str) -> PredictionResponse:
    prediction = get_latest_prediction(student_id)
    if not prediction:
        raise HTTPException(status_code=404,
                            detail="No prediction found. Ask your teacher to generate one.")
    return PredictionResponse(
        prediction_label=prediction.prediction_label,
        confidence_score=prediction.confidence_score,
        model_version=prediction.model_version,
        generated_at=prediction.generated_at,
    )

def fetch_history(student_id: str) -> List[HistoryItem]:
    history = get_prediction_history(student_id)
    return [HistoryItem(
        prediction_label=p.prediction_label,
        confidence_score=p.confidence_score,
        generated_at=p.generated_at,
    ) for p in history]
