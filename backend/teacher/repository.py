# teacher/repository.py
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
import database

def save_marks(student_id: str, uploaded_by: str, term: str, marks: Dict[str, float]) -> str:
    existing = database.academic_records.find_one({"student_id": student_id, "term": term})
    if existing:
        database.academic_records.update_one(
            {"student_id": student_id, "term": term},
            {"$set": {"marks": marks, "uploaded_by": uploaded_by, "uploaded_at": datetime.now(timezone.utc).isoformat()}}
        )
        return existing["record_id"]
    record_id = str(uuid.uuid4())
    database.academic_records.insert_one({
        "record_id": record_id,
        "student_id": student_id,
        "uploaded_by": uploaded_by,
        "term": term,
        "marks": marks,
        "attendance_pct": None,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    })
    return record_id

def update_attendance(student_id: str, term: str, attendance_pct: float) -> bool:
    result = database.academic_records.update_one(
        {"student_id": student_id, "term": term},
        {"$set": {"attendance_pct": attendance_pct}}
    )
    return result.matched_count > 0

def get_all_student_profiles() -> List[Dict[str, Any]]:
    return [{k: v for k, v in p.items() if k != "_id"} for p in database.student_profiles.find()]