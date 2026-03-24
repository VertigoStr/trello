"""
Password hashing service using bcrypt.
"""
import bcrypt
from typing import Tuple


def hash_password(password: str, cost_factor: int = 12) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        cost_factor: Bcrypt cost factor (default 12)
    
    Returns:
        Hashed password string
    """
    # Encode password to bytes
    password_bytes = password.encode('utf-8')
    
    # Generate salt and hash
    salt = bcrypt.gensalt(rounds=cost_factor)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        password: Plain text password to verify
        password_hash: Bcrypt hashed password
    
    Returns:
        True if password matches, False otherwise
    """
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hash_bytes)


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password meets requirements.
    
    Requirements:
    - Minimum 8 characters
    - At least one letter
    - At least one digit
    
    Args:
        password: Password to validate
    
    Returns:
        Tuple of (is_valid, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    if not has_letter:
        return False, "Password must contain at least one letter"
    
    if not has_digit:
        return False, "Password must contain at least one digit"
    
    return True, "Password is valid"
