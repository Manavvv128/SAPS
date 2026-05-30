# tests/test_auth_routes.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
import database
from app import app

client = TestClient(app)

def setup_function():
    database.users.clear()

def test_register_student_success():
    response = client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com",
        "password": "pass123", "role": "student"
    })
    assert response.status_code == 201
    assert response.json()["message"] == "User registered successfully"

def test_register_duplicate_email_fails():
    client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com",
        "password": "pass123", "role": "student"
    })
    response = client.post("/api/auth/register", json={
        "name": "Bob2", "email": "bob@test.com",
        "password": "pass456", "role": "student"
    })
    assert response.status_code == 409

def test_login_success_returns_token():
    client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com",
        "password": "pass123", "role": "student"
    })
    response = client.post("/api/auth/login", json={
        "email": "bob@test.com", "password": "pass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["role"] == "student"

def test_login_wrong_password_fails():
    client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com",
        "password": "pass123", "role": "student"
    })
    response = client.post("/api/auth/login", json={
        "email": "bob@test.com", "password": "wrongpass"
    })
    assert response.status_code == 401
