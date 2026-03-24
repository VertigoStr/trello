"""
Unit tests for JWT service with blacklist.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from src.services.jwt_service import JWTService


class TestJWTServiceWithBlacklist:
    """Tests for JWT service with token blacklist."""
    
    def test_create_access_token(self):
        """Test creating access token."""
        service = JWTService()
        user_id = uuid4()
        
        token = service.create_access_token(
            user_id=user_id,
            email="test@example.com",
        )
        
        assert isinstance(token, str)
        assert len(token) > 0
        assert token.count(".") == 2  # JWT format
    
    def test_decode_valid_token(self):
        """Test decoding valid token."""
        service = JWTService()
        user_id = uuid4()
        
        token = service.create_access_token(
            user_id=user_id,
            email="test@example.com",
        )
        
        payload = service.decode_token(token)
        
        assert payload["sub"] == str(user_id)
        assert payload["email"] == "test@example.com"
        assert "exp" in payload
        assert "iat" in payload
    
    def test_token_expiration(self):
        """Test token expiration."""
        # Create service with short expiration for testing
        service = JWTService(expiration_hours=1)
        user_id = uuid4()
        
        token = service.create_access_token(
            user_id=user_id,
            email="test@example.com",
        )
        
        payload = service.decode_token(token)
        
        # Token should expire in ~1 hour
        exp_time = datetime.fromtimestamp(payload["exp"])
        iat_time = datetime.fromtimestamp(payload["iat"])
        
        diff = (exp_time - iat_time).total_seconds()
        assert diff >= 3600  # At least 1 hour
    
    def test_is_token_expired(self):
        """Test checking if token is expired."""
        service = JWTService()
        user_id = uuid4()
        
        token = service.create_access_token(
            user_id=user_id,
            email="test@example.com",
        )
        
        # Token should not be expired
        assert service.is_token_expired(token) is False
