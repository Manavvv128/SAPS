# teacher/service.py
from typing import List, Dict, Any
from fastapi import HTTPException
import database
from teacher.repository import save_marks, update_attendance, get_all_student_profiles
from teacher.models import StudentSummary, DashboardStats
from prediction.service import generate_prediction, get_latest_prediction
from prediction.models import PredictionResult
from collections import defaultdict

def upload_marks(student_id: str, uploaded_by: str, term: str, marks: Dict[str, float]) -> Dict:
    if not database.student_profiles.find_one({"user_id": student_id}):
        raise HTTPException(status_code=404, detail="Student not found")
    record_id = save_marks(student_id, uploaded_by, term, marks)
    if record_id is None:
        raise HTTPException(status_code=403, detail="Access forbidden: another teacher owns this record")
    return {"message": "Marks uploaded successfully", "record_id": record_id}

def upload_attendance(student_id: str, uploaded_by: str, term: str, attendance_pct: float) -> Dict:
    if not database.student_profiles.find_one({"user_id": student_id}):
        raise HTTPException(status_code=404, detail="Student not found")
    result = update_attendance(student_id, term, attendance_pct, uploaded_by)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="No marks record found for this term. Upload marks first.")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="Access forbidden: another teacher owns this record")
    return {"message": "Attendance updated successfully"}

def trigger_prediction(student_id: str) -> PredictionResult:
    if not database.student_profiles.find_one({"user_id": student_id}):
        raise HTTPException(status_code=404, detail="Student not found")
    return generate_prediction(student_id)

def get_all_students() -> List[StudentSummary]:
    profiles = get_all_student_profiles()
    result = []
    for profile in profiles:
        latest = get_latest_prediction(profile["user_id"])
        result.append(StudentSummary(
            user_id=profile["user_id"],
            name=profile["name"],
            email=profile["email"],
            latest_prediction=latest.prediction_label if latest else None,
            confidence=latest.confidence_score if latest else None,
        ))
    return result

def get_dashboard_stats() -> DashboardStats:
    profiles = get_all_student_profiles()
    total = len(profiles)
    from collections import defaultdict
    label_dist: Dict[str, int] = defaultdict(int)
    students_with_preds = 0
    attendances = []
    all_marks = []

    for profile in profiles:
        latest = get_latest_prediction(profile["user_id"])
        if latest:
            students_with_preds += 1
            label_dist[latest.prediction_label] += 1
        records = list(database.academic_records.find({"student_id": profile["user_id"]}))
        for r in records:
            if r["attendance_pct"]:
                attendances.append(r["attendance_pct"])
            if r["marks"]:
                all_marks.extend(r["marks"].values())

    return DashboardStats(
        total_students=total,
        students_with_predictions=students_with_preds,
        label_distribution=label_dist,
        avg_attendance=round(sum(attendances) / len(attendances), 2) if attendances else None,
        avg_marks=round(sum(all_marks) / len(all_marks), 2) if all_marks else None,
    )