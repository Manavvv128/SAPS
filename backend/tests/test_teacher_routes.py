# tests/test_teacher_routes.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
import database
from app import app
from limiter import limiter

from prediction.engine import prediction_engine
prediction_engine.train()

limiter.enabled = False
client = TestClient(app)

def setup_function():
    database.users.delete_many({})
    database.academic_records.delete_many({})
    database.predictions.delete_many({})
    database.student_profiles.delete_many({})
    database.teacher_profiles.delete_many({})

def _register_and_login(role: str, email: str) -> str:
    client.post("/api/auth/register", json={"name": "User", "email": email,
                                             "password": "Password1!", "role": role})
    r = client.post("/api/auth/login", json={"email": email, "password": "Password1!"})
    return r.json()["access_token"]

def _get_student_id(email: str) -> str:
    student = database.users.find_one({"email": email})
    return student["user_id"]

def test_upload_marks_success():
    _register_and_login("student", "stu@test.com")
    student_id = _get_student_id("stu@test.com")
    teacher_token = _register_and_login("teacher", "tea@test.com")
    response = client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1",
        "marks": {"Math": 85, "Science": 78}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 201

def test_student_cannot_upload_marks():
    student_token = _register_and_login("student", "stu@test.com")
    student_id = _get_student_id("stu@test.com")
    response = client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1",
        "marks": {"Math": 85}
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 403

def test_upload_attendance_success():
    _register_and_login("student", "stu@test.com")
    student_id = _get_student_id("stu@test.com")
    teacher_token = _register_and_login("teacher", "tea@test.com")
    client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1", "marks": {"Math": 85}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    response = client.post("/api/teacher/attendance", json={
        "student_id": student_id, "term": "Term 1", "attendance_pct": 88.5
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 200

def test_predict_returns_label():
    _register_and_login("student", "stu@test.com")
    student_id = _get_student_id("stu@test.com")
    teacher_token = _register_and_login("teacher", "tea@test.com")
    client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1", "marks": {"Math": 85}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    client.post("/api/teacher/attendance", json={
        "student_id": student_id, "term": "Term 1", "attendance_pct": 88.5
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    response = client.post(f"/api/teacher/predict?student_id={student_id}",
                           headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 200
    assert response.json()["prediction_label"] in ["At Risk", "Average", "Good", "Excellent"]

def test_get_all_students_returns_list():
    _register_and_login("student", "stu@test.com")
    teacher_token = _register_and_login("teacher", "tea@test.com")
    response = client.get("/api/teacher/students",
                          headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dashboard_returns_stats():
    teacher_token = _register_and_login("teacher", "tea@test.com")
    response = client.get("/api/teacher/dashboard",
                          headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 200
    assert "total_students" in response.json()
