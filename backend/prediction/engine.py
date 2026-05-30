# prediction/engine.py
import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import sklearn
from typing import Dict, Any
from config import MODEL_PATH

LABELS = ["At Risk", "Average", "Good", "Excellent"]
SKLEARN_VERSION = sklearn.__version__

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
    MODEL_VERSION = "rf-v1.1"

    def __init__(self):
        self.model: RandomForestClassifier = None

    def _is_model_valid(self) -> bool:
        """Check if saved model exists and was trained with current sklearn version."""
        version_file = MODEL_PATH + ".version"
        if not os.path.exists(MODEL_PATH) or not os.path.exists(version_file):
            return False
        with open(version_file, "r") as f:
            saved_version = f.read().strip()
        return saved_version == SKLEARN_VERSION

    def train(self) -> None:
        if self._is_model_valid():
            with open(MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)
            return

        print(f"Training new model with sklearn {SKLEARN_VERSION}...")
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

        # Save the sklearn version alongside the model
        with open(MODEL_PATH + ".version", "w") as f:
            f.write(SKLEARN_VERSION)

        print(f"Model trained and saved (sklearn {SKLEARN_VERSION})")

    def predict(self, marks: Dict[str, float], attendance_pct: float) -> Dict[str, Any]:
        if not self.model:
            raise RuntimeError("Model not trained. Call engine.train() first.")
        if attendance_pct is None:
            raise ValueError("Attendance not yet recorded for this student")
        avg_marks = float(np.mean(list(marks.values()))) if marks else 0.0
        features = np.array([[avg_marks, attendance_pct]])
        label = self.model.predict(features)[0]
        proba = self.model.predict_proba(features)[0]
        confidence = float(max(proba))
        return {"label": label, "confidence": round(confidence, 4), "version": self.MODEL_VERSION}


# Singleton — trained once on import, reused for all requests
prediction_engine = PredictionEngine()
prediction_engine.train()