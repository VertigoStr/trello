"""
API routes for board member management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
import logging

from src.db.connection import get_db
from src.services.board_member_service import BoardMemberService
from src.services.permission_service import PermissionService
from src.api.schemas.board_member import (
    BoardMemberCreateRequest,
    BoardMemberUpdateRequest,
    BoardMemberResponse,
    BoardMembersListResponse,
)
from src.middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/boards/{board_id}/members", tags=["Board Members"])


@router.post(
    "",
    response_model=BoardMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add board member",
    description="Add a user as a board member. Only owner can add members.",
)
async def add_board_member(
    board_id: UUID,
    request: BoardMemberCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardMemberResponse:
    """
    Add a user as a board member.

    - **board_id**: Board UUID
    - **email**: Email of the user to add
    - **role**: Member role (owner/admin/member, default: member)
    - **permissions**: List of permissions (read/write/delete)

    Only board owner can add members.
    """
    board_member_service = BoardMemberService(db)
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
                "message": "Only board owner can add members",
            },
        )

    # Find user by email
    user = await board_member_service.find_user_by_email(request.email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "User with this email not found",
            },
        )

    try:
        member = await board_member_service.add_member(
            board_id=board_id,
            user_id=user.id,
            role=request.role,
            permissions=request.permissions,
        )

        return BoardMemberResponse(
            user_id=member.user_id,
            email=request.email,
            role=member.role,
            permissions=member.permissions,
            created_at=member.created_at,
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
    response_model=BoardMembersListResponse,
    status_code=status.HTTP_200_OK,
    summary="List board members",
    description="Get all members of a board.",
)
async def list_board_members(
    board_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardMembersListResponse:
    """
    List all members of a board.

    - **board_id**: Board UUID

    Returns all members with their roles and permissions.
    """
    board_member_service = BoardMemberService(db)
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

    members = await board_member_service.get_board_members(board_id)

    return BoardMembersListResponse(
        members=[
            BoardMemberResponse(
                user_id=m.user_id,
                email=m.user.email if hasattr(m, 'user') else "unknown",
                role=m.role,
                permissions=m.permissions,
                created_at=m.created_at,
            )
            for m in members
        ],
        total=len(members),
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove board member",
    description="Remove a user from board members. Only owner can remove members.",
)
async def remove_board_member(
    board_id: UUID,
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Remove a user from board members.

    - **board_id**: Board UUID
    - **user_id**: User UUID to remove

    Only board owner can remove members.
    """
    board_member_service = BoardMemberService(db)
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
                "message": "Only board owner can remove members",
            },
        )

    try:
        removed = await board_member_service.remove_member(
            board_id=board_id,
            user_id=user_id,
        )

        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "MEMBER_NOT_FOUND",
                    "message": "User is not a member of this board",
                },
            )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
            },
        )


@router.put(
    "/{user_id}/role",
    response_model=BoardMemberResponse,
    status_code=status.HTTP_200_OK,
    summary="Update member role",
    description="Update a member's role and permissions. Only owner can update roles.",
)
async def update_member_role(
    board_id: UUID,
    user_id: UUID,
    request: BoardMemberUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardMemberResponse:
    """
    Update a member's role and permissions.

    - **board_id**: Board UUID
    - **user_id**: User UUID
    - **role**: New role (owner/admin/member)
    - **permissions**: New permissions list

    Only board owner can update member roles.
    """
    board_member_service = BoardMemberService(db)
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
                "message": "Only board owner can update member roles",
            },
        )

    try:
        member = await board_member_service.update_member_role(
            board_id=board_id,
            user_id=user_id,
            role=request.role,
            permissions=request.permissions,
        )

        # Get user email
        member_obj = await board_member_service.get_member(board_id, user_id)
        email = "unknown"
        if member_obj and hasattr(member_obj, 'user'):
            email = member_obj.user.email

        return BoardMemberResponse(
            user_id=member.user_id,
            email=email,
            role=member.role,
            permissions=member.permissions,
            created_at=member.created_at,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
            },
        )
