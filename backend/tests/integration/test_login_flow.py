"""
Integration tests for login flow.
Tests verify the complete login workflow.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User


class TestLoginFlow:
    """Integration tests for login flow."""
    
    @pytest.mark.asyncio
    async def test_login_increments_failed_attempts(self, client: AsyncClient, test_session: AsyncSession):
        """Test that failed login increments failed_login_attempts."""
        # Register user
        register_payload = {
            "email": "failedlogin@example.com",
            "password": "CorrectPass123",
            "password_confirm": "CorrectPass123",
            "name": "Test User",
        }
        await client.post("/api/auth/register", json=register_payload)
        
        # Try to login with wrong password
        login_payload = {
            "email": "failedlogin@example.com",
            "password": "WrongPass123",
        }
        await client.post("/api/auth/login", json=login_payload)
        
        # Check failed attempts incremented
        result = await test_session.execute(
            select(User).where(User.email == "failedlogin@example.com")
        )
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.failed_login_attempts == 1
    
    @pytest.mark.asyncio
    async def test_login_resets_failed_attempts_on_success(self, client: AsyncClient, test_session: AsyncSession):
        """Test that successful login resets failed_login_attempts."""
        # Register user
        register_payload = {
            "email": "successlogin@example.com",
            "password": "CorrectPass123",
            "password_confirm": "CorrectPass123",
            "name": "Test User",
        }
        await client.post("/api/auth/register", json=register_payload)
        
        # Fail once
        wrong_login = {
            "email": "successlogin@example.com",
            "password": "WrongPass123",
        }
        await client.post("/api/auth/login", json=wrong_login)
        
        # Then succeed
        correct_login = {
            "email": "successlogin@example.com",
            "password": "CorrectPass123",
        }
        await client.post("/api/auth/login", json=correct_login)
        
        # Check failed attempts reset
        result = await test_session.execute(
            select(User).where(User.email == "successlogin@example.com")
        )
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.failed_login_attempts == 0
        assert user.locked_until is None
    
    @pytest.mark.asyncio
    async def test_login_account_locked_after_5_attempts(self, client: AsyncClient, test_session: AsyncSession):
        """Test that account is locked after 5 failed login attempts."""
        # Register user
        register_payload = {
            "email": "locked@example.com",
            "password": "CorrectPass123",
            "password_confirm": "CorrectPass123",
            "name": "Test User",
        }
        await client.post("/api/auth/register", json=register_payload)
        
        # Fail 5 times
        wrong_login = {
            "email": "locked@example.com",
            "password": "WrongPass123",
        }
        
        for _ in range(5):
            await client.post("/api/auth/login", json=wrong_login)
        
        # Check account is locked
        result = await test_session.execute(
            select(User).where(User.email == "locked@example.com")
        )
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.failed_login_attempts == 5
        assert user.locked_until is not None
        
        # Try to login with correct password - should fail
        correct_login = {
            "email": "locked@example.com",
            "password": "CorrectPass123",
        }
        response = await client.post("/api/auth/login", json=correct_login)
        
        assert response.status_code == 423
        data = response.json()
        assert data["error"]["code"] == "ACCOUNT_LOCKED"
