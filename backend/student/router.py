# student/router.py
from fastapi import APIRouter, Depends
from typing import List, Dict
from middleware.auth_guard import require_role
from student.models import ProgressResponse, PredictionResponse, HistoryItem
from student.service import fetch_progress, fetch_prediction, fetch_history

router = APIRouter(prefix="/api/student", tags=["Student"])

@router.get("/progress", response_model=ProgressResponse)
def progress(current_user: Dict = Depends(require_role("student"))):
    return fetch_progress(current_user["user_id"])

@router.get("/prediction", response_model=PredictionResponse)
def prediction(current_user: Dict = Depends(require_role("student"))):
    return fetch_prediction(current_user["user_id"])

@router.get("/history", response_model=List[HistoryItem])
def history(current_user: Dict = Depends(require_role("student"))):
    return fetch_history(current_user["user_id"])
