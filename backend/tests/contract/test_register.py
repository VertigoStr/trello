"""
Contract tests for POST /api/auth/register endpoint.
Tests verify the API contract specification.
"""
import pytest
from httpx import AsyncClient


class TestRegisterContract:
    """Contract tests for registration endpoint."""
    
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Test successful registration returns 201 with user data and token."""
        payload = {
            "email": "test@example.com",
            "password": "TestPass123",
            "password_confirm": "TestPass123",
            "name": "Test User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 201
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
        assert data["data"]["email"] == payload["email"]
        assert data["data"]["name"] == payload["name"]
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with existing email returns 409."""
        payload = {
            "email": "duplicate@example.com",
            "password": "TestPass123",
            "password_confirm": "TestPass123",
            "name": "Test User",
        }
        
        # First registration
        response1 = await client.post("/api/auth/register", json=payload)
        assert response1.status_code == 201
        
        # Duplicate registration
        response2 = await client.post("/api/auth/register", json=payload)
        
        assert response2.status_code == 409
        data = response2.json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "USER_EXISTS"
    
    @pytest.mark.asyncio
    async def test_register_password_mismatch(self, client: AsyncClient):
        """Test registration with mismatched passwords returns 400."""
        payload = {
            "email": "test@example.com",
            "password": "TestPass123",
            "password_confirm": "DifferentPass456",
            "name": "Test User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    @pytest.mark.asyncio
    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password returns 400."""
        payload = {
            "email": "test@example.com",
            "password": "weak",  # Too short, no digits
            "password_confirm": "weak",
            "name": "Test User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email returns 422."""
        payload = {
            "email": "invalid-email",
            "password": "TestPass123",
            "password_confirm": "TestPass123",
            "name": "Test User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_register_missing_fields(self, client: AsyncClient):
        """Test registration with missing required fields returns 422."""
        payload = {
            "email": "test@example.com",
            # Missing password, password_confirm, name
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 422
