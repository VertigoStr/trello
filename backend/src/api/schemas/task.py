"""
Task schemas for request/response validation.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (1-255 characters)",
    )
    description: Optional[str] = Field(
        None,
        max_length=10000,
        description="Optional task description (up to 10000 characters)",
    )
    assignee_id: Optional[UUID] = Field(
        None,
        description="UUID of the assignee (must be a board member)",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Implement feature",
                "description": "Add task creation API endpoint",
                "assignee_id": "550e8400-e29b-41d4-a716-446655440000",
            }
        }
    )


class TaskUpdate(BaseModel):
    """Schema for updating a task."""

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Task title (1-255 characters)",
    )
    description: Optional[str] = Field(
        None,
        max_length=10000,
        description="Optional task description",
    )
    assignee_id: Optional[UUID] = Field(
        None,
        description="UUID of the assignee",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Updated title",
                "description": "Updated description",
                "assignee_id": "550e8400-e29b-41d4-a716-446655440000",
            }
        }
    )


class TaskMove(BaseModel):
    """Schema for moving a task."""

    column_id: UUID = Field(
        ...,
        description="Target column UUID",
    )
    position: Optional[float] = Field(
        None,
        ge=0,
        description="Target position (float). If None, appends to end.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "column_id": "550e8400-e29b-41d4-a716-446655440000",
                "position": 2.5,
            }
        }
    )


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: UUID
    column_id: UUID
    title: str
    description: Optional[str]
    assignee_id: Optional[UUID]
    position: float
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    version: int

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    """Schema for paginated task list."""

    tasks: list[TaskResponse]
    pagination: dict

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tasks": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "column_id": "550e8400-e29b-41d4-a716-446655440001",
                        "title": "Task 1",
                        "description": "Description",
                        "assignee_id": "550e8400-e29b-41d4-a716-446655440002",
                        "position": 1.0,
                        "is_deleted": False,
                        "created_at": "2026-03-25T10:00:00Z",
                        "updated_at": "2026-03-25T10:00:00Z",
                        "version": 1,
                    }
                ],
                "pagination": {
                    "page": 1,
                    "limit": 20,
                    "total": 50,
                    "total_pages": 3,
                },
            }
        }
    )
