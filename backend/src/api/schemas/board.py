"""
Pydantic schemas for board API endpoints.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from enum import Enum


class BoardStatusEnum(str, Enum):
    """Board status enumeration for API."""
    ACTIVE = "active"
    ARCHIVED = "archived"


class BoardCreateRequest(BaseModel):
    """Request schema for creating a board."""
    
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Board title (1-255 characters)",
        examples=["Моя доска"],
    )
    description: Optional[str] = Field(
        None,
        max_length=10000,
        description="Board description (optional, up to 10000 characters)",
        examples=["Описание моей доски"],
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "title": "Моя доска",
            "description": "Описание моей доски",
        }
    })


class BoardUpdateRequest(BaseModel):
    """Request schema for updating a board."""
    
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Board title (1-255 characters)",
    )
    description: Optional[str] = Field(
        None,
        max_length=10000,
        description="Board description (optional)",
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "title": "Обновлённое название",
            "description": "Новое описание",
        }
    })


class BoardResponse(BaseModel):
    """Response schema for board operations."""
    
    id: UUID
    title: str
    description: Optional[str]
    owner_id: UUID
    status: BoardStatusEnum
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BoardListResponse(BaseModel):
    """Response schema for boards list with pagination."""
    
    boards: List[BoardResponse]
    pagination: dict
    
    model_config = ConfigDict(from_attributes=True)
