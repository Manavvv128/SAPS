# student/repository.py
from typing import Optional, Dict, Any
import database

def get_latest_academic_record(student_id: str) -> Optional[Dict[str, Any]]:
    records = list(database.academic_records.find({"student_id": student_id}))
    if not records:
        return None
    record = sorted(records, key=lambda r: r["uploaded_at"], reverse=True)[0]
    record.pop("_id", None)
    return record