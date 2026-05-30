import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import database
from prediction.service import generate_prediction, get_latest_prediction, get_prediction_history
from prediction.engine import prediction_engine
prediction_engine.train()

def setup_function():
    database.academic_records.delete_many({})
    database.predictions.delete_many({})
    database.student_profiles.delete_many({})

def _add_record(student_id):
    database.academic_records.insert_one({
        "record_id": "r1",
        "student_id": student_id,
        "uploaded_by": "teacher1",
        "term": "Term 1",
        "marks": {"Math": 85, "Science": 78},
        "attendance_pct": 90.0,
        "uploaded_at": "2024-01-01T00:00:00+00:00",
    })
    database.student_profiles.insert_one({"user_id": student_id, "name": "Test", "email": "t@t.com"})

def test_generate_prediction_returns_result():
    _add_record("s1")
    result = generate_prediction("s1")
    assert result.prediction_label in ["At Risk", "Average", "Good", "Excellent"]
    assert 0.0 <= result.confidence_score <= 1.0

def test_generate_prediction_stores_in_db():
    _add_record("s1")
    generate_prediction("s1")
    assert database.predictions.count_documents({"student_id": "s1"}) == 1

def test_get_latest_prediction_returns_most_recent():
    _add_record("s1")
    generate_prediction("s1")
    result = get_latest_prediction("s1")
    assert result is not None
    assert result.prediction_label in ["At Risk", "Average", "Good", "Excellent"]

def test_get_latest_prediction_returns_none_if_none():
    result = get_latest_prediction("nonexistent")
    assert result is None

def test_get_prediction_history_returns_all():
    _add_record("s1")
    generate_prediction("s1")
    generate_prediction("s1")
    history = get_prediction_history("s1")
    assert len(history) == 2
