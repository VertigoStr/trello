"""
Unit tests for user validation.
"""
import pytest
from src.services.password_service import validate_password, hash_password, verify_password


class TestPasswordValidation:
    """Tests for password validation logic."""
    
    def test_password_too_short(self):
        """Test that password shorter than 8 characters is invalid."""
        is_valid, message = validate_password("Short1!")
        assert is_valid is False
        assert "at least 8 characters" in message
    
    def test_password_no_letters(self):
        """Test that password without letters is invalid."""
        is_valid, message = validate_password("12345678")
        assert is_valid is False
        assert "at least one letter" in message
    
    def test_password_no_digits(self):
        """Test that password without digits is invalid."""
        is_valid, message = validate_password("Abcdefgh")
        assert is_valid is False
        assert "at least one digit" in message
    
    def test_password_valid(self):
        """Test that valid password passes validation."""
        is_valid, message = validate_password("ValidPass123")
        assert is_valid is True
        assert message == "Password is valid"
    
    def test_password_exactly_8_chars(self):
        """Test password with exactly 8 characters."""
        is_valid, message = validate_password("Pass1234")
        assert is_valid is True
    
    def test_password_with_special_chars(self):
        """Test password with special characters."""
        is_valid, message = validate_password("P@ssw0rd!")
        assert is_valid is True


class TestPasswordHashing:
    """Tests for password hashing."""
    
    def test_hash_password_returns_different_string(self):
        """Test that hashed password is different from plain text."""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert hashed.startswith("$2b$")
    
    def test_verify_password_correct(self):
        """Test that correct password verifies successfully."""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test that incorrect password fails verification."""
        password = "TestPassword123"
        wrong_password = "WrongPassword456"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_hash_password_unique_salts(self):
        """Test that same password produces different hashes."""
        password = "SamePassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2  # Different salts
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True
