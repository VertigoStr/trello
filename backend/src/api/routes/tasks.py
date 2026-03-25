"""
Task API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from src.db.database import get_db
from src.services.task_service import TaskService
from src.api.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskMove,
    TaskResponse,
    TaskListResponse,
)
from src.middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/api", tags=["tasks"])


@router.post(
    "/boards/{board_id}/columns/{column_id}/tasks",
    response_model=TaskResponse,
    status_code=201,
)
async def create_task(
    board_id: UUID,
    column_id: UUID,
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Create a new task in a column.

    - **board_id**: UUID of the board
    - **column_id**: UUID of the target column
    - **title**: Task title (1-255 characters)
    - **description**: Optional task description
    - **assignee_id**: Optional assignee UUID (defaults to creator)
    """
    task_service = TaskService(db)

    # TODO: Add permission check for write access to board

    try:
        task = await task_service.create_task(
            column_id=column_id,
            title=task_data.title,
            creator_id=current_user_id,
            description=task_data.description,
            assignee_id=task_data.assignee_id,
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/boards/{board_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    board_id: UUID,
    column_id: Optional[UUID] = Query(None),
    assignee_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    List tasks with optional filtering and pagination.

    - **board_id**: UUID of the board
    - **column_id**: Optional filter by column
    - **assignee_id**: Optional filter by assignee
    - **page**: Page number (1-based)
    - **limit**: Items per page (1-100)
    """
    task_service = TaskService(db)

    # TODO: Add permission check for read access to board

    tasks, total = await task_service.list_tasks(
        column_id=column_id,
        assignee_id=assignee_id,
        page=page,
        limit=limit,
    )

    return {
        "tasks": tasks,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Get a task by ID.

    - **task_id**: UUID of the task
    """
    task_service = TaskService(db)

    # TODO: Add permission check for access to task

    task = await task_service.get_task(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    if_match: Optional[str] = Header(None, alias="If-Match"),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Update a task with optimistic locking.

    - **task_id**: UUID of the task
    - **title**: New title (optional)
    - **description**: New description (optional)
    - **assignee_id**: New assignee (optional)
    - **If-Match**: ETag (version) for optimistic locking
    """
    task_service = TaskService(db)

    # Parse version from ETag
    version = None
    if if_match:
        # ETag format: "1" or 1
        version_str = if_match.strip('"')
        try:
            version = int(version_str)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid If-Match header format"
            )

    # TODO: Add permission check for edit access

    task, conflict = await task_service.update_task(
        task_id=task_id,
        title=task_data.title,
        description=task_data.description,
        assignee_id=task_data.assignee_id,
        version=version,
    )

    if task is None:
        if conflict:
            # Get current task data for conflict response
            current_task = await task_service.get_task(task_id)
            raise HTTPException(
                status_code=412,
                detail={
                    "code": "CONFLICT",
                    "message": "Task was modified by another user. Please refresh and try again.",
                    "current_version": current_task.version if current_task else None,
                    "current_data": (
                        {
                            "title": current_task.title,
                            "description": current_task.description,
                            "assignee_id": current_task.assignee_id,
                        }
                        if current_task
                        else None
                    ),
                },
            )
        else:
            raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.post("/tasks/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: UUID,
    move_data: TaskMove,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Move a task to a different column and/or position.

    - **task_id**: UUID of the task
    - **column_id**: Target column UUID
    - **position**: Target position (float). If None, appends to end.
    """
    task_service = TaskService(db)

    # TODO: Add permission check for write access to board

    task = await task_service.move_task(
        task_id=task_id,
        column_id=move_data.column_id,
        position=move_data.position,
    )

    if task is None:
        # Check if it's because column doesn't exist
        raise HTTPException(status_code=404, detail="Task or column not found")

    return task


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Soft delete a task.

    - **task_id**: UUID of the task
    """
    task_service = TaskService(db)

    # TODO: Add permission check for delete access

    deleted = await task_service.delete_task(task_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")

    return Response(status_code=204)


@router.post("/tasks/{task_id}/unassign", response_model=TaskResponse)
async def unassign_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Unassign yourself from a task.

    - **task_id**: UUID of the task
    """
    task_service = TaskService(db)

    task = await task_service.unassign_task(
        task_id=task_id,
        user_id=current_user_id,
    )

    if task is None:
        # Check if task exists
        existing_task = await task_service.get_task(task_id)
        if existing_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        # Task exists but user is not the assignee
        raise HTTPException(
            status_code=403, detail="You are not the assignee of this task"
        )

    return task
