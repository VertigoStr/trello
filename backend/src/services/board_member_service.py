"""
Board Member service for managing board participants.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Tuple
from uuid import UUID
import logging

from src.models.board import Board
from src.models.board_member import BoardMember
from src.models.user import User

logger = logging.getLogger(__name__)


class BoardMemberService:
    """
    Service for board member management.

    Handles adding, removing, and updating board members
    with proper permission checks.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_member(
        self,
        board_id: UUID,
        user_id: UUID,
        role: str = "member",
        permissions: Optional[List[str]] = None,
    ) -> BoardMember:
        """
        Add a user as a board member.

        Args:
            board_id: Board UUID
            user_id: User UUID to add
            role: Member role (owner/admin/member)
            permissions: List of permissions (read/write/delete)

        Returns:
            Created BoardMember

        Raises:
            ValueError: If user is already a member
        """
        # Check if user is already a member
        existing = await self.get_member(board_id, user_id)
        if existing:
            raise ValueError("User is already a member of this board")

        # Default permissions based on role
        if permissions is None:
            if role == "owner":
                permissions = ["read", "write", "delete"]
            elif role == "admin":
                permissions = ["read", "write"]
            else:
                permissions = ["read"]

        # Create member
        member = BoardMember(
            board_id=board_id,
            user_id=user_id,
            role=role,
            permissions=permissions,
        )

        self.db.add(member)
        await self.db.flush()
        await self.db.refresh(member)

        logger.info(f"Member added: user_id={user_id}, board_id={board_id}, role={role}")

        return member

    async def remove_member(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Remove a user from board members.

        Args:
            board_id: Board UUID
            user_id: User UUID to remove

        Returns:
            True if removed, False if not found
        """
        member = await self.get_member(board_id, user_id)

        if member is None:
            return False

        # Prevent owner from removing themselves if they're the only owner
        if member.role == "owner":
            owners = await self.get_board_owners(board_id)
            if len(owners) <= 1:
                raise ValueError("Cannot remove the only owner of the board")

        await self.db.delete(member)
        await self.db.flush()

        logger.info(f"Member removed: user_id={user_id}, board_id={board_id}")

        return True

    async def update_member_role(
        self,
        board_id: UUID,
        user_id: UUID,
        role: str,
        permissions: Optional[List[str]] = None,
    ) -> BoardMember:
        """
        Update a member's role and permissions.

        Args:
            board_id: Board UUID
            user_id: User UUID
            role: New role (owner/admin/member)
            permissions: New permissions list

        Returns:
            Updated BoardMember

        Raises:
            ValueError: If user is not a member
        """
        member = await self.get_member(board_id, user_id)

        if member is None:
            raise ValueError("User is not a member of this board")

        # Update role
        member.role = role

        # Update permissions if provided
        if permissions is not None:
            member.permissions = permissions
        else:
            # Default permissions based on role
            if role == "owner":
                member.permissions = ["read", "write", "delete"]
            elif role == "admin":
                member.permissions = ["read", "write"]
            else:
                member.permissions = ["read"]

        await self.db.flush()
        await self.db.refresh(member)

        logger.info(f"Member role updated: user_id={user_id}, board_id={board_id}, role={role}")

        return member

    async def get_member(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> Optional[BoardMember]:
        """
        Get board member by board and user ID.

        Args:
            board_id: Board UUID
            user_id: User UUID

        Returns:
            BoardMember if found, None otherwise
        """
        result = await self.db.execute(
            select(BoardMember).where(
                BoardMember.board_id == board_id,
                BoardMember.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_board_members(
        self,
        board_id: UUID,
    ) -> List[BoardMember]:
        """
        Get all members of a board.

        Args:
            board_id: Board UUID

        Returns:
            List of BoardMember
        """
        result = await self.db.execute(
            select(BoardMember).where(BoardMember.board_id == board_id)
        )
        return list(result.scalars().all())

    async def get_board_owners(
        self,
        board_id: UUID,
    ) -> List[BoardMember]:
        """
        Get all owners of a board.

        Args:
            board_id: Board UUID

        Returns:
            List of BoardMember with role 'owner'
        """
        result = await self.db.execute(
            select(BoardMember).where(
                BoardMember.board_id == board_id,
                BoardMember.role == "owner",
            )
        )
        return list(result.scalars().all())

    async def find_user_by_email(
        self,
        email: str,
    ) -> Optional[User]:
        """
        Find user by email address.

        Args:
            email: User email

        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
