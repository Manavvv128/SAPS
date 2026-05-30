# tests/test_student_routes.py
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

def _setup_student_with_data():
    student_token = _register_and_login("student", "stu@test.com")
    student = database.users.find_one({"email": "stu@test.com"})
    student_id = student["user_id"]
    teacher_token = _register_and_login("teacher", "tea@test.com")
    client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1", "marks": {"Math": 85, "Science": 78}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    client.post("/api/teacher/attendance", json={
        "student_id": student_id, "term": "Term 1", "attendance_pct": 90.0
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    client.post(f"/api/teacher/predict?student_id={student_id}",
                headers={"Authorization": f"Bearer {teacher_token}"})
    return student_token, student_id

def test_student_can_view_progress():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert "marks" in response.json()
    assert "attendance_pct" in response.json()

def test_student_can_view_prediction():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/prediction",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["prediction_label"] in ["At Risk", "Average", "Good", "Excellent"]

def test_student_can_view_history():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/history",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_teacher_cannot_access_student_routes():
    teacher_token = _register_and_login("teacher", "tea@test.com")
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 403

def test_student_no_record_returns_404():
    student_token = _register_and_login("student", "stu@test.com")
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 404

def test_student_no_prediction_returns_404():
    student_token = _register_and_login("student", "stu@test.com")
    response = client.get("/api/student/prediction",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 404# tests/test_student_routes.py
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

def _setup_student_with_data():
    student_token = _register_and_login("student", "stu@test.com")
    student = database.users.find_one({"email": "stu@test.com"})
    student_id = student["user_id"]
    teacher_token = _register_and_login("teacher", "tea@test.com")
    client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1", "marks": {"Math": 85, "Science": 78}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    client.post("/api/teacher/attendance", json={
        "student_id": student_id, "term": "Term 1", "attendance_pct": 90.0
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    client.post(f"/api/teacher/predict?student_id={student_id}",
                headers={"Authorization": f"Bearer {teacher_token}"})
    return student_token, student_id

def test_student_can_view_progress():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert "marks" in response.json()
    assert "attendance_pct" in response.json()

def test_student_can_view_prediction():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/prediction",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert response.json()["prediction_label"] in ["At Risk", "Average", "Good", "Excellent"]

def test_student_can_view_history():
    student_token, _ = _setup_student_with_data()
    response = client.get("/api/student/history",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1

def test_teacher_cannot_access_student_routes():
    teacher_token = _register_and_login("teacher", "tea@test.com")
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {teacher_token}"})
    assert response.status_code == 403

def test_student_no_record_returns_404():
    student_token = _register_and_login("student", "stu@test.com")
    response = client.get("/api/student/progress",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 404

def test_student_no_prediction_returns_404():
    student_token = _register_and_login("student", "stu@test.com")
    response = client.get("/api/student/prediction",
                          headers={"Authorization": f"Bearer {student_token}"})
    assert response.status_code == 404
