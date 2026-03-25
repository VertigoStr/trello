"""
Board model for task boards management.
"""
from typing import TYPE_CHECKING

from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from uuid import UUID, uuid4

from src.db.base import BaseModel


class Board(BaseModel):
    """
    Board model for task management.
    
    Represents a task board where users can organize their work
    using columns and tasks.
    """
    
    __tablename__ = "boards"
    
    # Title field (required, 1-255 characters)
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    
    # Description field (optional, up to 10000 characters)
    description: Mapped[str | None] = mapped_column(
        String(10000),
        nullable=True,
    )
    
    # Owner reference (users.id from auth API)
    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Board status
    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
        index=True,
    )
    
    # Relationships
    members: Mapped[list["BoardMember"]] = relationship(
        "BoardMember",
        back_populates="board",
        cascade="all, delete-orphan",
    )
    columns: Mapped[list["Column"]] = relationship(
        "Column",
        back_populates="board",
        cascade="all, delete-orphan",
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_boards_owner_id", "owner_id"),
        Index("idx_boards_status", "status"),
        Index("idx_boards_created_at", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<Board(id={self.id}, title='{self.title}', owner_id={self.owner_id})>"


# Import BoardMember and Column for relationship type hints
# Deferred to avoid circular imports
if TYPE_CHECKING:
    from src.models.board_member import BoardMember
    from src.models.column import Column
