# auth/router.py
from fastapi import APIRouter, Request
from auth.models import RegisterRequest, LoginRequest, TokenResponse
from auth.service import register_user, login_user
from limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
@limiter.limit("10/minute")
def register(request: Request, payload: RegisterRequest):
    return register_user(payload.name, payload.email, payload.password, payload.role)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest):
    return login_user(payload.email, payload.password)