"""
Pydantic schemas for registration endpoints.
"""
from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional
from uuid import UUID


class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User's password (min 8 chars, must contain letters and digits)",
        examples=["SecurePass123"],
    )
    password_confirm: str = Field(
        ...,
        description="Password confirmation (must match password)",
        examples=["SecurePass123"],
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="User's display name",
        examples=["John Doe"],
    )
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password contains letters and digits."""
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not has_letter:
            raise ValueError('Password must contain at least one letter')
        if not has_digit:
            raise ValueError('Password must contain at least one digit')
        
        return v
    
    @field_validator('password_confirm')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Validate passwords match."""
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v


class RegisterResponse(BaseModel):
    """Response schema for successful registration."""
    
    user_id: UUID = Field(
        ...,
        description="User's unique identifier",
    )
    email: EmailStr = Field(
        ...,
        description="User's email address",
    )
    name: str = Field(
        ...,
        description="User's display name",
    )
    access_token: str = Field(
        ...,
        description="JWT access token",
    )
    token_type: str = Field(
        default="Bearer",
        description="Token type",
    )
    expires_in: int = Field(
        ...,
        description="Token expiration time in seconds",
        examples=[604800],  # 7 days
    )
    
    class Config:
        from_attributes = True


class RegisterErrorResponse(BaseModel):
    """Response schema for registration errors."""
    
    status: str = Field(
        default="error",
        description="Response status",
    )
    error: dict = Field(
        ...,
        description="Error details",
    )
