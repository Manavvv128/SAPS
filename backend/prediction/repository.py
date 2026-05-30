# prediction/repository.py
from typing import List, Optional, Dict, Any
import database

def save_prediction(prediction: Dict[str, Any]) -> None:
    database.predictions.insert_one(prediction)

def get_predictions_for_student(student_id: str) -> List[Dict[str, Any]]:
    return [{k: v for k, v in p.items() if k != "_id"} for p in database.predictions.find({"student_id": student_id})]

def get_latest_prediction_for_student(student_id: str) -> Optional[Dict[str, Any]]:
    preds = get_predictions_for_student(student_id)
    if not preds:
        return None
    return sorted(preds, key=lambda p: p["generated_at"], reverse=True)[0]