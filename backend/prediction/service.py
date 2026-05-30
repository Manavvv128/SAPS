# prediction/service.py
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException
import uuid

import database
from prediction.engine import prediction_engine
from prediction.models import PredictionResult
from prediction.repository import save_prediction, get_predictions_for_student, get_latest_prediction_for_student
from logger import get_logger
logger = get_logger("prediction")

def _get_latest_record(student_id: str):
    records = list(database.academic_records.find({"student_id": student_id}))
    if not records:
        raise HTTPException(status_code=404, detail="No academic record found for this student")
    record = sorted(records, key=lambda r: r["uploaded_at"], reverse=True)[0]
    record.pop("_id", None)
    return record

def generate_prediction(student_id: str) -> PredictionResult:
    record = _get_latest_record(student_id)
    try:
        result = prediction_engine.predict(record["marks"], record["attendance_pct"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=503, detail="Prediction service unavailable")
    prediction = {
        "prediction_id": str(uuid.uuid4()),
        "student_id": student_id,
        "academic_record_id": record.get("record_id"),
        "prediction_label": result["label"],
        "confidence_score": result["confidence"],
        "model_version": result["version"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    save_prediction(prediction)
    logger.info(f"Prediction generated: student_id={student_id} label={result['label']} confidence={result['confidence']} by model={result['version']}")
    return PredictionResult(**prediction)

def get_latest_prediction(student_id: str) -> Optional[PredictionResult]:
    p = get_latest_prediction_for_student(student_id)
    if not p:
        return None
    return PredictionResult(**p)

def get_prediction_history(student_id: str) -> List[PredictionResult]:
    preds = get_predictions_for_student(student_id)
    sorted_preds = sorted(preds, key=lambda p: p["generated_at"], reverse=True)
    return [PredictionResult(**p) for p in sorted_preds]
