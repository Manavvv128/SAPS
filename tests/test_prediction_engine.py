# tests/test_prediction_engine.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from prediction.engine import PredictionEngine

engine = PredictionEngine()
engine.train()

def test_predict_returns_label_and_confidence():
    result = engine.predict({"Math": 80, "Science": 75}, 90.0)
    assert "label" in result
    assert "confidence" in result
    assert result["label"] in ["At Risk", "Average", "Good", "Excellent"]
    assert 0.0 <= result["confidence"] <= 1.0

def test_low_attendance_predicts_at_risk():
    result = engine.predict({"Math": 85, "Science": 90}, 50.0)
    assert result["label"] == "At Risk"

def test_low_marks_predicts_at_risk():
    result = engine.predict({"Math": 20, "Science": 25}, 80.0)
    assert result["label"] == "At Risk"

def test_high_marks_high_attendance_predicts_excellent():
    result = engine.predict({"Math": 95, "Science": 92}, 97.0)
    assert result["label"] == "Excellent"
