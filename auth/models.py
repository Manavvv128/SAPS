# auth/models.py
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Literal

class RegisterRequest(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Alice Smith"})
    email: EmailStr = Field(..., json_schema_extra={"example": "alice@school.com"})
    password: str = Field(..., json_schema_extra={"example": "Password123"})
    role: Literal["student", "teacher"] = Field(..., json_schema_extra={"example": "student"})

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "alice@school.com"})
    password: str = Field(..., json_schema_extra={"example": "Password123"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str