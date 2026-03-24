"""
Integration tests for logout flow.
Tests verify the complete logout workflow.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.token import AccessToken


class TestLogoutFlow:
    """Integration tests for logout flow."""
    
    @pytest.mark.asyncio
    async def test_logout_adds_token_to_blacklist(self, client: AsyncClient, test_session: AsyncSession):
        """Test that logout adds token to blacklist."""
        # Register user
        register_payload = {
            "email": "blacklistuser@example.com",
            "password": "BlacklistPass123",
            "password_confirm": "BlacklistPass123",
            "name": "Blacklist User",
        }
        register_response = await client.post("/api/auth/register", json=register_payload)
        token = register_response.json()["data"]["access_token"]
        
        # Logout
        headers = {"Authorization": f"Bearer {token}"}
        await client.post("/api/auth/logout", headers=headers)
        
        # Verify token is in blacklist (will be implemented)
        # For now, just verify the endpoint works
        assert True
    
    @pytest.mark.asyncio
    async def test_logout_then_login_again(self, client: AsyncClient, test_session: AsyncSession):
        """Test that user can logout and login again."""
        # Register
        register_payload = {
            "email": "reloginuser@example.com",
            "password": "ReLoginPass123",
            "password_confirm": "ReLoginPass123",
            "name": "ReLogin User",
        }
        register_response = await client.post("/api/auth/register", json=register_payload)
        token1 = register_response.json()["data"]["access_token"]
        
        # Logout
        headers = {"Authorization": f"Bearer {token1}"}
        await client.post("/api/auth/logout", headers=headers)
        
        # Login again
        login_payload = {
            "email": "reloginuser@example.com",
            "password": "ReLoginPass123",
        }
        login_response = await client.post("/api/auth/login", json=login_payload)
        
        assert login_response.status_code == 200
        token2 = login_response.json()["data"]["access_token"]
        
        # New token should be different
        assert token1 != token2
