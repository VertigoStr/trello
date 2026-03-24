"""
Integration tests for registration flow.
Tests verify the complete registration workflow.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User


class TestRegisterFlow:
    """Integration tests for registration flow."""
    
    @pytest.mark.asyncio
    async def test_register_creates_user_in_database(self, client: AsyncClient, test_session: AsyncSession):
        """Test that registration creates a user in the database."""
        payload = {
            "email": "newuser@example.com",
            "password": "SecurePass123",
            "password_confirm": "SecurePass123",
            "name": "New User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 201
        
        # Verify user exists in database
        result = await test_session.execute(
            select(User).where(User.email == "newuser@example.com")
        )
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.email == "newuser@example.com"
        assert user.name == "New User"
        assert user.is_active is True
        assert user.failed_login_attempts == 0
    
    @pytest.mark.asyncio
    async def test_register_password_not_stored_in_plain_text(self, client: AsyncClient, test_session: AsyncSession):
        """Test that password is hashed, not stored in plain text."""
        payload = {
            "email": "secure@example.com",
            "password": "MySecretPassword123",
            "password_confirm": "MySecretPassword123",
            "name": "Secure User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 201
        
        # Verify password is hashed
        result = await test_session.execute(
            select(User).where(User.email == "secure@example.com")
        )
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.password_hash != "MySecretPassword123"
        assert user.password_hash.startswith("$2b$")  # bcrypt prefix
    
    @pytest.mark.asyncio
    async def test_register_returns_valid_jwt_token(self, client: AsyncClient):
        """Test that registration returns a valid JWT token."""
        payload = {
            "email": "jwtuser@example.com",
            "password": "JwtPass123",
            "password_confirm": "JwtPass123",
            "name": "JWT User",
        }
        
        response = await client.post("/api/auth/register", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify token structure
        token = data["data"]["access_token"]
        assert isinstance(token, str)
        assert len(token) > 0
        assert token.count(".") == 2  # JWT has 3 parts separated by dots
