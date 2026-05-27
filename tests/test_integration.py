# tests/test_integration.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
import database
from app import app

client = TestClient(app)

def setup_function():
    database.users.clear()
    database.academic_records.clear()
    database.predictions.clear()
    database.student_profiles.clear()

def test_full_teacher_student_flow():
    # 1. Register student
    r = client.post("/api/auth/register", json={
        "name": "Alice", "email": "alice@school.com", "password": "pass123", "role": "student"
    })
    assert r.status_code == 201
    student_id = database.users["alice@school.com"]["user_id"]

    # 2. Register teacher
    r = client.post("/api/auth/register", json={
        "name": "Mr Smith", "email": "smith@school.com", "password": "pass123", "role": "teacher"
    })
    assert r.status_code == 201

    # 3. Login both
    r = client.post("/api/auth/login", json={"email": "smith@school.com", "password": "pass123"})
    assert r.status_code == 200
    teacher_token = r.json()["access_token"]
    assert r.json()["role"] == "teacher"

    r = client.post("/api/auth/login", json={"email": "alice@school.com", "password": "pass123"})
    assert r.status_code == 200
    student_token = r.json()["access_token"]
    assert r.json()["role"] == "student"

    # 4. Teacher uploads marks
    r = client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 1",
        "marks": {"Math": 82, "Science": 76, "English": 88}
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 201
    assert "record_id" in r.json()

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
    assert 0.0 <= pred["confidence_score"] <= 1.0
    assert pred["model_version"] == "rf-v1.0"

    # 7. Student views progress
    r = client.get("/api/student/progress",
                   headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    progress = r.json()
    assert progress["marks"]["Math"] == 82
    assert progress["attendance_pct"] == 91.5
    assert progress["term"] == "Term 1"

    # 8. Student views prediction
    r = client.get("/api/student/prediction",
                   headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    assert r.json()["prediction_label"] in ["At Risk", "Average", "Good", "Excellent"]
    assert "confidence_score" in r.json()

    # 9. Student views history
    r = client.get("/api/student/history",
                   headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 200
    assert len(r.json()) == 1

    # 10. Teacher views all students
    r = client.get("/api/teacher/students",
                   headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 200
    students = r.json()
    assert len(students) == 1
    assert students[0]["email"] == "alice@school.com"
    assert students[0]["latest_prediction"] in ["At Risk", "Average", "Good", "Excellent"]

    # 11. Teacher views dashboard
    r = client.get("/api/teacher/dashboard",
                   headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 200
    dash = r.json()
    assert dash["total_students"] == 1
    assert dash["students_with_predictions"] == 1
    assert dash["avg_marks"] is not None
    assert dash["avg_attendance"] == 91.5

    # 12. Role enforcement checks
    r = client.get("/api/student/progress",
                   headers={"Authorization": f"Bearer {teacher_token}"})
    assert r.status_code == 403

    r = client.post("/api/teacher/marks", json={
        "student_id": student_id, "term": "Term 2", "marks": {"Math": 70}
    }, headers={"Authorization": f"Bearer {student_token}"})
    assert r.status_code == 403

    # 13. Swagger schema is accessible
    r = client.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    assert "BearerAuth" in schema["components"]["securitySchemes"]
    assert "/api/auth/register" in schema["paths"]
    assert "/api/teacher/marks" in schema["paths"]
    assert "/api/student/progress" in schema["paths"]
