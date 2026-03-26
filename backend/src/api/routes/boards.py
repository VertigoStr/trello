"""
API routes for task boards CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
import logging

from src.db.connection import get_db
from src.services.board_service import BoardService
from src.services.column_service import ColumnService
from src.services.permission_service import PermissionService
from src.api.schemas.board import (
    BoardCreateRequest,
    BoardUpdateRequest,
    BoardResponse,
)
from src.api.schemas.column import ColumnCreate, ColumnUpdate, ColumnMove, ColumnResponse
from src.middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Boards"])


@router.post("/boards", response_model=BoardResponse, status_code=201)
async def create_board(
    request: BoardCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardResponse:
    """
    Create a new task board.
    
    - **title**: Board title (1-255 characters, required)
    - **description**: Board description (optional, up to 10000 characters)
    
    The creating user becomes the board owner with full permissions.
    
    Returns:
    - **id**: Board unique identifier
    - **title**: Board title
    - **description**: Board description
    - **owner_id**: Owner's user ID
    - **status**: Board status (active/archived)
    - **created_at**: Creation timestamp
    - **updated_at**: Last update timestamp
    """
    board_service = BoardService(db)
    
    try:
        board, owner_member = await board_service.create_board(
            owner_id=current_user["user_id"],
            title=request.title,
            description=request.description,
        )
        
        return BoardResponse(
            id=board.id,
            title=board.title,
            description=board.description,
            owner_id=board.owner_id,
            status=board.status,
            created_at=board.created_at,
            updated_at=board.updated_at,
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
            },
        )


@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="List boards",
    description="Get all boards for the current user with pagination.",
)
async def list_boards(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status (active/archived)"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    List all boards for the current user.
    
    - **page**: Page number (1-based, default: 1)
    - **limit**: Items per page (1-100, default: 20)
    - **status**: Filter by status (active/archived, optional)
    
    Returns boards where user is owner or member.
    """
    board_service = BoardService(db)

    # Parse status filter (as string, not enum)
    status_value = None
    if status_filter:
        if status_filter not in ['active', 'archived']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "INVALID_STATUS",
                    "message": "Status must be 'active' or 'archived'",
                },
            )
        status_value = status_filter

    boards, total = await board_service.get_boards_for_user(
        user_id=current_user["user_id"],
        page=page,
        limit=limit,
        status=status_value,
    )
    
    return {
        "boards": [
            BoardResponse(
                id=b.id,
                title=b.title,
                description=b.description,
                owner_id=b.owner_id,
                status=b.status,
                created_at=b.created_at,
                updated_at=b.updated_at,
            )
            for b in boards
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


@router.get(
    "/{board_id}",
    response_model=BoardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get board",
    description="Get detailed information about a specific board.",
)
async def get_board(
    board_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardResponse:
    """
    Get board details by ID.
    
    - **board_id**: Board UUID
    
    Returns 403 if user doesn't have access to the board.
    Returns 404 if board doesn't exist.
    """
    board_service = BoardService(db)
    permission_service = PermissionService(db)
    
    board = await board_service.get_board(board_id)
    
    if board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "BOARD_NOT_FOUND",
                "message": "Board not found",
            },
        )
    
    # Check access
    has_access = await permission_service.has_permission(
        board_id=board_id,
        user_id=current_user["user_id"],
        permission="read",
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ACCESS_DENIED",
                "message": "You do not have access to this board",
            },
        )
    
    return BoardResponse(
        id=board.id,
        title=board.title,
        description=board.description,
        owner_id=board.owner_id,
        status=board.status,
        created_at=board.created_at,
        updated_at=board.updated_at,
    )


@router.put(
    "/{board_id}",
    response_model=BoardResponse,
    status_code=status.HTTP_200_OK,
    summary="Update board",
    description="Update board settings. Only owner can update.",
)
async def update_board(
    board_id: UUID,
    request: BoardUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardResponse:
    """
    Update board settings.
    
    - **board_id**: Board UUID
    - **title**: New title (optional, 1-255 characters)
    - **description**: New description (optional)
    
    Only board owner can update board settings.
    """
    board_service = BoardService(db)
    permission_service = PermissionService(db)
    
    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=board_id,
        user_id=current_user["user_id"],
    )
    
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can update board settings",
            },
        )
    
    try:
        board = await board_service.update_board(
            board_id=board_id,
            title=request.title,
            description=request.description,
        )
        
        if board is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "BOARD_NOT_FOUND",
                    "message": "Board not found",
                },
            )
        
        return BoardResponse(
            id=board.id,
            title=board.title,
            description=board.description,
            owner_id=board.owner_id,
            status=board.status,
            created_at=board.created_at,
            updated_at=board.updated_at,
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
            },
        )


@router.delete(
    "/{board_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete board",
    description="Delete board and all related data. Only owner can delete.",
)
async def delete_board(
    board_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete board and all related data (cascade).
    
    - **board_id**: Board UUID
    
    Only board owner can delete. Deletes all columns, tasks, and members.
    """
    board_service = BoardService(db)
    permission_service = PermissionService(db)
    
    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=board_id,
        user_id=current_user["user_id"],
    )
    
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can delete the board",
            },
        )

    deleted = await board_service.delete_board(board_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "BOARD_NOT_FOUND",
                "message": "Board not found",
            },
        )


# Column endpoints

@router.post("/boards/{board_id}/columns", response_model=ColumnResponse, status_code=201)
async def create_column(
    board_id: UUID,
    column_data: ColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> ColumnResponse:
    """
    Create a new column on a board.

    - **board_id**: Board UUID
    - **title**: Column title (1-255 characters)

    Only board owner can create columns.
    """
    column_service = ColumnService(db)
    permission_service = PermissionService(db)

    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=board_id,
        user_id=current_user["user_id"],
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can create columns",
            },
        )

    column = await column_service.create_column(
        board_id=board_id,
        title=column_data.title,
    )

    return ColumnResponse(
        id=column.id,
        board_id=column.board_id,
        title=column.title,
        position=column.position,
        created_at=column.created_at,
        updated_at=column.updated_at,
    )


@router.get("/boards/{board_id}/columns", response_model=list[ColumnResponse])
async def get_columns(
    board_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> list[ColumnResponse]:
    """
    Get all columns for a board.

    - **board_id**: Board UUID

    Returns columns sorted by position.
    """
    column_service = ColumnService(db)
    permission_service = PermissionService(db)

    # Check access
    has_access = await permission_service.has_permission(
        board_id=board_id,
        user_id=current_user["user_id"],
        permission="read",
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ACCESS_DENIED",
                "message": "You do not have access to this board",
            },
        )

    columns = await column_service.get_columns(board_id)

    return [
        ColumnResponse(
            id=c.id,
            board_id=c.board_id,
            title=c.title,
            position=c.position,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in columns
    ]


@router.put("/columns/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: UUID,
    column_data: ColumnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> ColumnResponse:
    """
    Update a column.

    - **column_id**: Column UUID
    - **title**: New title (optional)

    Only board owner can update columns.
    """
    column_service = ColumnService(db)
    permission_service = PermissionService(db)

    column = await column_service.get_column(column_id)
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "COLUMN_NOT_FOUND",
                "message": "Column not found",
            },
        )

    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=column.board_id,
        user_id=current_user["user_id"],
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can update columns",
            },
        )

    updated = await column_service.update_column(
        column_id=column_id,
        title=column_data.title,
    )

    return ColumnResponse(
        id=updated.id,
        board_id=updated.board_id,
        title=updated.title,
        position=updated.position,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.delete("/columns/{column_id}", status_code=204)
async def delete_column(
    column_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> None:
    """
    Delete a column (cascade deletes all tasks).

    - **column_id**: Column UUID

    Only board owner can delete columns.
    """
    column_service = ColumnService(db)
    permission_service = PermissionService(db)

    column = await column_service.get_column(column_id)
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "COLUMN_NOT_FOUND",
                "message": "Column not found",
            },
        )

    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=column.board_id,
        user_id=current_user["user_id"],
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can delete columns",
            },
        )

    deleted = await column_service.delete_column(column_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "COLUMN_NOT_FOUND",
                "message": "Column not found",
            },
        )


@router.put("/columns/{column_id}/move", response_model=ColumnResponse)
async def move_column(
    column_id: UUID,
    move_data: ColumnMove,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> ColumnResponse:
    """
    Move a column to a new position.

    - **column_id**: Column UUID
    - **position**: New position (0-based index)

    Only board owner can move columns.
    """
    column_service = ColumnService(db)
    permission_service = PermissionService(db)

    column = await column_service.get_column(column_id)
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "COLUMN_NOT_FOUND",
                "message": "Column not found",
            },
        )

    # Check owner permission
    is_owner = await permission_service.is_owner(
        board_id=column.board_id,
        user_id=current_user["user_id"],
    )

    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "OWNER_ONLY",
                "message": "Only board owner can move columns",
            },
        )

    moved = await column_service.move_column(
        column_id=column_id,
        new_position=move_data.position,
    )

    return ColumnResponse(
        id=moved.id,
        board_id=moved.board_id,
        title=moved.title,
        position=moved.position,
        created_at=moved.created_at,
        updated_at=moved.updated_at,
    )
