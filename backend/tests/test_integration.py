import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
import database
from app import app

from prediction.engine import prediction_engine
prediction_engine.train()

client = TestClient(app, raise_server_exceptions=True)

def setup_function():
    database.users.delete_many({})
    database.academic_records.delete_many({})
    database.predictions.delete_many({})
    database.student_profiles.delete_many({})
    database.teacher_profiles.delete_many({})

def test_full_teacher_student_flow():
    # 1. Register student
    r = client.post("/api/auth/register", json={
        "name": "Alice", "email": "alice@school.com", "password": "Password1!", "role": "student"
    })
    assert r.status_code == 201
    student = database.users.find_one({"email": "alice@school.com"})
    student_id = student["user_id"]

    # 2. Register teacher
    r = client.post("/api/auth/register", json={
        "name": "Mr Smith", "email": "smith@school.com", "password": "Password1!", "role": "teacher"
    })
    assert r.status_code == 201

    # 3. Login both
    r = client.post("/api/auth/login", json={"email": "smith@school.com", "password": "Password1!"})
    assert r.status_code == 200
    teacher_token = r.json()["access_token"]

    r = client.post("/api/auth/login", json={"email": "alice@school.com", "password": "Password1!"})
    assert r.status_code == 200
    student_token = r.json()["access_token"]

    # 4. Teacher uploads marks
    r = client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1",
        "marks": {"Math": 82, "Science": 76, "English": 88}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 201

    # 5. Teacher uploads attendance
    r = client.post("/api/teacher/attendance", json={
        "student_id": student_id, "term": "Term 1", "attendance_pct": 91.5
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 200

    # 6. Teacher triggers prediction
    r = client.post(f"/api/teacher/predict?student_id={student_id}",
                    headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 200
    pred = r.json()
    assert pred["prediction_label"] in ["At Risk", "Average", "Good", "Excellent"]

    # 7. Student views progress
    r = client.get("/api/student/progress",
                   headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200

    # 8. Student views prediction
    r = client.get("/api/student/prediction",
                   headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
