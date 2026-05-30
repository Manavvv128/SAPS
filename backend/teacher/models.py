# teacher/models.py
from pydantic import BaseModel, Field
from typing import Dict, Optional, Annotated

# Define a constrained float type for mark values
MarksValue = Annotated[float, Field(ge=0.0, le=100.0)]

class MarksUpload(BaseModel):
    student_id: str = Field(..., json_schema_extra={"example": "abc-123"})
    term: str = Field(..., json_schema_extra={"example": "Term 1"})
    marks: Dict[str, MarksValue] = Field(..., json_schema_extra={"example": {"Math": 85.0, "Science": 78.0}})
    
class AttendanceUpload(BaseModel):
    student_id: str = Field(..., json_schema_extra={"example": "abc-123"})
    term: str = Field(..., json_schema_extra={"example": "Term 1"})
    attendance_pct: float = Field(..., ge=0.0, le=100.0, json_schema_extra={"example": 88.5})

class StudentSummary(BaseModel):
    user_id: str
    name: str
    email: str
    latest_prediction: Optional[str] = None
    confidence: Optional[float] = None

class DashboardStats(BaseModel):
    total_students: int
    students_with_predictions: int
    label_distribution: Dict[str, int]
    avg_attendance: Optional[float] = None
    avg_marks: Optional[float] = None
