"""
BoardMember model for managing board participants with flexible permissions.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from uuid import UUID

from src.db.base import BaseModel


class BoardMember(BaseModel):
    """
    BoardMember model for tracking board participants.
    
    Stores the relationship between users and boards with role-based
    permissions for flexible access control.
    """
    
    __tablename__ = "board_members"
    
    # Board reference
    board_id: Mapped[UUID] = mapped_column(
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # User reference (from auth API)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Role (owner/admin/member)
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
    )
    
    # Custom permissions (JSONB array)
    permissions: Mapped[list[str]] = mapped_column(
        JSONB,
        default=["read"],
        nullable=False,
    )
    
    # Relationships
    board: Mapped["Board"] = relationship(
        "Board",
        back_populates="members",
    )
    
    # Indexes and constraints
    __table_args__ = (
        Index("idx_board_members_board_id", "board_id"),
        Index("idx_board_members_user_id", "user_id"),
        UniqueConstraint("board_id", "user_id", name="uq_board_members_board_user"),
    )
    
    def __repr__(self) -> str:
        return f"<BoardMember(board_id={self.board_id}, user_id={self.user_id}, role='{self.role}')>"
    
    def has_permission(self, permission: str) -> bool:
        """
        Check if member has specific permission.
        
        Args:
            permission: Permission to check (read/write/delete)
        
        Returns:
            True if member has the permission, False otherwise
        """
        # Owner always has all permissions
        if self.role == "owner":
            return True
        
        return permission in self.permissions
    
    def is_owner(self) -> bool:
        """Check if member is board owner."""
        return self.role == "owner"
    
    def is_admin(self) -> bool:
        """Check if member is board admin."""
        return self.role == "admin"


# Deferred import for type hints
if TYPE_CHECKING:
    from src.models.board import Board
