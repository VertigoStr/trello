"""
Input sanitization utilities.
"""
import re
from html import escape
from typing import Any, Union


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize a string input.
    
    - Strips whitespace
    - Escapes HTML special characters
    - Limits length
    
    Args:
        value: String to sanitize
        max_length: Maximum allowed length
    
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        return value
    
    # Strip whitespace
    value = value.strip()
    
    # Limit length
    if len(value) > max_length:
        value = value[:max_length]
    
    # Escape HTML to prevent XSS
    value = escape(value)
    
    return value


def sanitize_email(email: str) -> str:
    """
    Sanitize email address.
    
    Args:
        email: Email to sanitize
    
    Returns:
        Sanitized email in lowercase
    """
    if not isinstance(email, str):
        return email
    
    # Strip and lowercase
    email = email.strip().lower()
    
    return email


def sanitize_dict(data: dict, max_length: int = 1000) -> dict:
    """
    Sanitize all string values in a dictionary.
    
    Args:
        data: Dictionary to sanitize
        max_length: Maximum string length
    
    Returns:
        Sanitized dictionary
    """
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value, max_length)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value, max_length)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_string(item, max_length) if isinstance(item, str) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized


def is_valid_uuid(value: str) -> bool:
    """
    Check if string is a valid UUID.
    
    Args:
        value: String to check
    
    Returns:
        True if valid UUID, False otherwise
    """
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(value))


def sanitize_search_query(query: str, max_length: int = 100) -> str:
    """
    Sanitize search query.
    
    - Removes special regex characters
    - Limits length
    
    Args:
        query: Search query to sanitize
        max_length: Maximum length
    
    Returns:
        Sanitized search query
    """
    if not isinstance(query, str):
        return query
    
    # Strip whitespace
    query = query.strip()
    
    # Limit length
    if len(query) > max_length:
        query = query[:max_length]
    
    # Escape special regex characters
    special_chars = r'[](){}.*+?^$|\\'
    for char in special_chars:
        query = query.replace(char, f'\\{char}')
    
    return query
