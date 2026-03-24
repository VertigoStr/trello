"""
Unit tests for auth service and rate limiter.
"""
import pytest
from datetime import datetime, timedelta

from src.services.password_service import validate_password
from src.models.user import User


class TestAuthRateLimiting:
    """Tests for rate limiting and account lockout."""
    
    def test_user_lockout_after_5_attempts(self):
        """Test that user is locked after 5 failed attempts."""
        user = User(
            email="test@example.com",
            password_hash="hashed",
            name="Test User",
        )
        
        # Simulate 5 failed attempts
        for i in range(5):
            user.increment_failed_attempts()
        
        assert user.failed_login_attempts == 5
        assert user.is_locked() is True
        assert user.locked_until is not None
        
        # Lockout should be 15 minutes from now
        expected_unlock = datetime.utcnow() + timedelta(minutes=15)
        time_diff = abs((user.locked_until - expected_unlock).total_seconds())
        assert time_diff < 2  # Allow 2 seconds tolerance
    
    def test_user_not_locked_before_5_attempts(self):
        """Test that user is not locked before 5 failed attempts."""
        user = User(
            email="test@example.com",
            password_hash="hashed",
            name="Test User",
        )
        
        # Simulate 4 failed attempts
        for i in range(4):
            user.increment_failed_attempts()
        
        assert user.failed_login_attempts == 4
        assert user.is_locked() is False
    
    def test_user_unlocks_after_timeout(self):
        """Test that user unlocks after lockout period."""
        user = User(
            email="test@example.com",
            password_hash="hashed",
            name="Test User",
        )
        
        # Lock the user
        for i in range(5):
            user.increment_failed_attempts()
        
        assert user.is_locked() is True
        
        # Simulate time passing (set locked_until to past)
        user.locked_until = datetime.utcnow() - timedelta(minutes=1)
        
        assert user.is_locked() is False
    
    def test_reset_failed_attempts(self):
        """Test that reset_failed_attempts clears lockout."""
        user = User(
            email="test@example.com",
            password_hash="hashed",
            name="Test User",
        )
        
        # Lock the user
        for i in range(5):
            user.increment_failed_attempts()
        
        assert user.is_locked() is True
        
        # Reset
        user.reset_failed_attempts()
        
        assert user.failed_login_attempts == 0
        assert user.locked_until is None
        assert user.is_locked() is False
