# teacher/router.py
from fastapi import APIRouter, Depends, Query
from typing import List, Dict
from middleware.auth_guard import require_role
from teacher.models import MarksUpload, AttendanceUpload, StudentSummary, DashboardStats
from teacher.service import upload_marks, upload_attendance, trigger_prediction, get_all_students, get_dashboard_stats

router = APIRouter(prefix="/api/teacher", tags=["Teacher"])

@router.post("/marks", status_code=201)
def post_marks(payload: MarksUpload, current_user: Dict = Depends(require_role("teacher"))):
    return upload_marks(payload.student_id, current_user["user_id"], payload.term, payload.marks)

@router.post("/attendance")
def post_attendance(payload: AttendanceUpload, current_user: Dict = Depends(require_role("teacher"))):
    return upload_attendance(payload.student_id, current_user["user_id"], payload.term, payload.attendance_pct)

@router.post("/predict")
def predict(student_id: str = Query(..., json_schema_extra={"example": "abc-123"}),
            current_user: Dict = Depends(require_role("teacher"))):
    return trigger_prediction(student_id)

@router.get("/students", response_model=List[StudentSummary])
def list_students(current_user: Dict = Depends(require_role("teacher"))):
    return get_all_students()

@router.get("/dashboard", response_model=DashboardStats)
def dashboard(current_user: Dict = Depends(require_role("teacher"))):
    return get_dashboard_stats()
