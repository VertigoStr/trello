"""
Pydantic schemas for board member API endpoints.
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, List


class BoardMemberCreateRequest(BaseModel):
    """Request schema for adding a board member."""

    email: EmailStr = Field(
        ...,
        description="Email of the user to add",
        examples=["user@example.com"],
    )
    role: str = Field(
        default="member",
        description="Member role (owner/admin/member)",
        examples=["member"],
    )
    permissions: Optional[List[str]] = Field(
        default=None,
        description="List of permissions (read/write/delete)",
        examples=[["read", "write"]],
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "user@example.com",
            "role": "member",
            "permissions": ["read", "write"],
        }
    })


class BoardMemberUpdateRequest(BaseModel):
    """Request schema for updating a board member's role."""

    role: str = Field(
        ...,
        description="New role (owner/admin/member)",
        examples=["admin"],
    )
    permissions: Optional[List[str]] = Field(
        default=None,
        description="List of permissions (read/write/delete)",
        examples=[["read", "write", "delete"]],
    )

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "role": "admin",
            "permissions": ["read", "write", "delete"],
        }
    })


class BoardMemberResponse(BaseModel):
    """Response schema for board member operations."""

    user_id: UUID
    email: str
    role: str
    permissions: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BoardMembersListResponse(BaseModel):
    """Response schema for listing board members."""

    members: List[BoardMemberResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
