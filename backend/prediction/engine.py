# prediction/engine.py
import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from typing import Dict, Any
from config import MODEL_PATH

LABELS = ["At Risk", "Average", "Good", "Excellent"]

def _assign_label(avg_marks: float, attendance: float) -> str:
    if attendance < 75 or avg_marks < 40:
        return "At Risk"
    elif avg_marks < 60:
        return "Average"
    elif avg_marks < 80:
        return "Good"
    else:
        return "Excellent"

class PredictionEngine:
    MODEL_VERSION = "rf-v1.0"

    def __init__(self):
        self.model: RandomForestClassifier = None

    def train(self) -> None:
        """Train on 500 generated dummy records. Saves model.pkl for reuse."""
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)
            return

        np.random.seed(42)
        n = 500
        avg_marks = np.random.uniform(0, 100, n)
        attendance = np.random.uniform(0, 100, n)
        X = np.column_stack([avg_marks, attendance])
        y = [_assign_label(m, a) for m, a in zip(avg_marks, attendance)]

        X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)

        with open(MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)

    def predict(self, marks: Dict[str, float], attendance_pct: float) -> Dict[str, Any]:
        """
        marks: dict of subject -> score (e.g. {"Math": 80, "Science": 75})
        attendance_pct: float 0-100
        Returns: {"label": str, "confidence": float, "version": str}
        """
        if not self.model:
            raise RuntimeError("Model not trained. Call engine.train() first.")
        avg_marks = float(np.mean(list(marks.values()))) if marks else 0.0
        features = np.array([[avg_marks, attendance_pct]])
        label = self.model.predict(features)[0]
        proba = self.model.predict_proba(features)[0]
        confidence = float(max(proba))
        return {"label": label, "confidence": round(confidence, 4), "version": self.MODEL_VERSION}


# Singleton — trained once on import (or at app startup), reused for all requests
prediction_engine = PredictionEngine()
prediction_engine.train()
