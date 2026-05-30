# prediction/repository.py
from typing import List, Optional, Dict, Any
import database

def save_prediction(prediction: Dict[str, Any]) -> None:
    database.predictions.append(prediction)

def get_predictions_for_student(student_id: str) -> List[Dict[str, Any]]:
    return [p for p in database.predictions if p["student_id"] == student_id]

def get_latest_prediction_for_student(student_id: str) -> Optional[Dict[str, Any]]:
    student_preds = get_predictions_for_student(student_id)
    if not student_preds:
        return None
    return sorted(student_preds, key=lambda p: p["generated_at"], reverse=True)[0]
