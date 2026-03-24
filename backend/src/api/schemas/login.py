"""
Pydantic schemas for login endpoints.
"""
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class LoginRequest(BaseModel):
    """Request schema for user login."""
    
    email: EmailStr = Field(
        ...,
        description="User's email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        description="User's password",
        examples=["SecurePass123"],
    )


class LoginResponse(BaseModel):
    """Response schema for successful login."""
    
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
