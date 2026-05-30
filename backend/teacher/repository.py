# teacher/repository.py
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import database

def save_marks(student_id: str, uploaded_by: str, term: str, marks: Dict[str, float]) -> str:
    existing = database.academic_records.find_one({"student_id": student_id, "term": term})
    if existing:
        # Only the teacher who created the record can update it
        if existing["uploaded_by"] != uploaded_by:
            return None  # signal ownership violation
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

def update_attendance(student_id: str, term: str, attendance_pct: float, uploaded_by: str) -> Optional[str]:
    existing = database.academic_records.find_one({"student_id": student_id, "term": term})
    if not existing:
        return "not_found"
    if existing["uploaded_by"] != uploaded_by:
        return "forbidden"
    database.academic_records.update_one(
        {"student_id": student_id, "term": term},
        {"$set": {"attendance_pct": attendance_pct}}
    )
    return "ok"

def get_all_student_profiles() -> List[Dict[str, Any]]:
    return [{k: v for k, v in p.items() if k != "_id"} for p in database.student_profiles.find()]