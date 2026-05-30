# auth/router.py
from fastapi import APIRouter
from auth.models import RegisterRequest, LoginRequest, TokenResponse
from auth.service import register_user, login_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
def register(payload: RegisterRequest):
    return register_user(payload.name, payload.email, payload.password, payload.role)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return login_user(payload.email, payload.password)
