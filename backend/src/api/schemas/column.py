"""
Pydantic schemas for column API.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional


class ColumnCreate(BaseModel):
    """Schema for creating a column."""

    title: str = Field(..., min_length=1, max_length=255)

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()


class ColumnUpdate(BaseModel):
    """Schema for updating a column."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError("Title cannot be empty")
        return v.strip() if v else v


class ColumnMove(BaseModel):
    """Schema for moving a column."""

    position: int = Field(..., ge=0)


class ColumnResponse(BaseModel):
    """Schema for column response."""

    id: UUID
    board_id: UUID
    title: str
    position: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ColumnListResponse(BaseModel):
    """Schema for list of columns."""

    columns: list[ColumnResponse]
