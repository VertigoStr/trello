"""
Permission service for role-based access control.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID
import logging

from src.models.board_member import BoardMember

logger = logging.getLogger(__name__)


class PermissionService:
    """
    Service for checking user permissions on boards.
    
    Implements role-based access control with flexible permissions.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
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
    
    async def has_permission(
        self,
        board_id: UUID,
        user_id: UUID,
        permission: str,
    ) -> bool:
        """
        Check if user has specific permission on board.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
            permission: Permission to check (read/write/delete)
        
        Returns:
            True if user has permission, False otherwise
        """
        member = await self.get_member(board_id, user_id)
        
        if member is None:
            return False
        
        return member.has_permission(permission)
    
    async def is_owner(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user is board owner.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user is owner, False otherwise
        """
        member = await self.get_member(board_id, user_id)
        
        if member is None:
            return False
        
        return member.is_owner()
    
    async def is_admin(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user is board admin.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user is admin, False otherwise
        """
        member = await self.get_member(board_id, user_id)
        
        if member is None:
            return False
        
        return member.is_admin()
    
    async def can_edit_board(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user can edit board settings.
        
        Only board owners can edit board settings.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user can edit board, False otherwise
        """
        return await self.is_owner(board_id, user_id)
    
    async def can_delete_board(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user can delete board.
        
        Only board owners can delete boards.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user can delete board, False otherwise
        """
        return await self.is_owner(board_id, user_id)
    
    async def can_manage_members(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user can manage board members.
        
        Only board owners can manage members.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user can manage members, False otherwise
        """
        return await self.is_owner(board_id, user_id)
    
    async def can_edit_tasks(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user can create/edit tasks.
        
        Owners and admins can edit tasks by default.
        Members need 'write' permission.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user can edit tasks, False otherwise
        """
        member = await self.get_member(board_id, user_id)
        
        if member is None:
            return False
        
        # Owner and admin can always edit tasks
        if member.is_owner() or member.is_admin():
            return True
        
        # Members need write permission
        return member.has_permission("write")
    
    async def can_delete_tasks(
        self,
        board_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Check if user can delete tasks.
        
        Owners and admins can delete tasks by default.
        Members need 'delete' permission.
        
        Args:
            board_id: Board UUID
            user_id: User UUID
        
        Returns:
            True if user can delete tasks, False otherwise
        """
        member = await self.get_member(board_id, user_id)
        
        if member is None:
            return False
        
        # Owner and admin can always delete tasks
        if member.is_owner() or member.is_admin():
            return True
        
        # Members need delete permission
        return member.has_permission("delete")
