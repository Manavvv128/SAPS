# teacher/repository.py
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
import database

def save_marks(student_id: str, uploaded_by: str, term: str, marks: Dict[str, float]) -> str:
    # Update existing record for student+term, or create new one
    for record in database.academic_records:
        if record["student_id"] == student_id and record["term"] == term:
            record["marks"] = marks
            record["uploaded_by"] = uploaded_by
            record["uploaded_at"] = datetime.now(timezone.utc).isoformat()
            return record["record_id"]
    record_id = str(uuid.uuid4())
    database.academic_records.append({
        "record_id": record_id,
        "student_id": student_id,
        "uploaded_by": uploaded_by,
        "term": term,
        "marks": marks,
        "attendance_pct": 0.0,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    })
    return record_id

def update_attendance(student_id: str, term: str, attendance_pct: float) -> bool:
    for record in database.academic_records:
        if record["student_id"] == student_id and record["term"] == term:
            record["attendance_pct"] = attendance_pct
            return True
    return False

def get_all_student_profiles() -> List[Dict[str, Any]]:
    return list(database.student_profiles.values())
