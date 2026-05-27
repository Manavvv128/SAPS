# auth/models.py
from pydantic import BaseModel, Field
from typing import Literal

class RegisterRequest(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Alice Smith"})
    email: str = Field(..., json_schema_extra={"example": "alice@school.com"})
    password: str = Field(..., json_schema_extra={"example": "password123"})
    role: Literal["student", "teacher"] = Field(..., json_schema_extra={"example": "student"})

class LoginRequest(BaseModel):
    email: str = Field(..., json_schema_extra={"example": "alice@school.com"})
    password: str = Field(..., json_schema_extra={"example": "password123"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
