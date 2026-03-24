"""
Contract tests for POST /api/auth/login endpoint.
Tests verify the API contract specification.
"""
import pytest
from httpx import AsyncClient


class TestLoginContract:
    """Contract tests for login endpoint."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        """Test successful login returns 200 with user data and token."""
        # First register a user
        register_payload = {
            "email": "loginuser@example.com",
            "password": "LoginPass123",
            "password_confirm": "LoginPass123",
            "name": "Login User",
        }
        await client.post("/api/auth/register", json=register_payload)
        
        # Login
        login_payload = {
            "email": "loginuser@example.com",
            "password": "LoginPass123",
        }
        
        response = await client.post("/api/auth/login", json=login_payload)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        assert "user_id" in data["data"]
        assert "email" in data["data"]
        assert "name" in data["data"]
        assert "access_token" in data["data"]
        assert "token_type" in data["data"]
        assert data["data"]["token_type"] == "Bearer"
        assert "expires_in" in data["data"]
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials returns 401."""
        payload = {
            "email": "nonexistent@example.com",
            "password": "WrongPass123",
        }
        
        response = await client.post("/api/auth/login", json=payload)
        
        assert response.status_code == 401
        data = response.json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "INVALID_CREDENTIALS"
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password returns 401."""
        # First register a user
        register_payload = {
            "email": "wrongpass@example.com",
            "password": "CorrectPass123",
            "password_confirm": "CorrectPass123",
            "name": "Test User",
        }
        await client.post("/api/auth/register", json=register_payload)
        
        # Login with wrong password
        login_payload = {
            "email": "wrongpass@example.com",
            "password": "WrongPass456",
        }
        
        response = await client.post("/api/auth/login", json=login_payload)
        
        assert response.status_code == 401
        data = response.json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "INVALID_CREDENTIALS"
    
    @pytest.mark.asyncio
    async def test_login_invalid_email_format(self, client: AsyncClient):
        """Test login with invalid email format returns 422."""
        payload = {
            "email": "invalid-email",
            "password": "TestPass123",
        }
        
        response = await client.post("/api/auth/login", json=payload)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client: AsyncClient):
        """Test login with missing required fields returns 422."""
        payload = {
            "email": "test@example.com",
            # Missing password
        }
        
        response = await client.post("/api/auth/login", json=payload)
        
        assert response.status_code == 422
