# student/repository.py
from typing import Optional, Dict, Any
import database

def get_latest_academic_record(student_id: str) -> Optional[Dict[str, Any]]:
    records = [r for r in database.academic_records if r["student_id"] == student_id]
    if not records:
        return None
    return sorted(records, key=lambda r: r["uploaded_at"], reverse=True)[0]
