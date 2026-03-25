"""
Task model for individual work items on a board.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from uuid import UUID

from src.db.base import BaseModel


class Task(BaseModel):
    """
    Task model for individual work items.
    
    Represents a single task/card within a column on a board.
    Supports soft delete for recovery of accidentally deleted tasks.
    """
    
    __tablename__ = "tasks"
    
    # Column reference
    column_id: Mapped[UUID] = mapped_column(
        ForeignKey("columns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Task title (required, 1-255 characters)
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    # Task description (optional, up to 10000 characters)
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Position in the column (0-based index)
    position: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )
    
    # Assignee reference (optional, from auth API)
    assignee_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    
    # Soft delete flag
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )
    
    # Relationships
    column: Mapped["Column"] = relationship(
        "Column",
        back_populates="tasks",
    )
    assignee: Mapped["User"] = relationship(
        "User",
        back_populates="tasks",
        foreign_keys=[assignee_id],
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_tasks_column_id", "column_id"),
        Index("idx_tasks_assignee_id", "assignee_id"),
        Index("idx_tasks_position", "position"),
        Index("idx_tasks_is_deleted", "is_deleted"),
    )
    
    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', column_id={self.column_id})>"
    
    def soft_delete(self) -> None:
        """Mark task as deleted without removing from database."""
        self.is_deleted = True
    
    def restore(self) -> None:
        """Restore a soft-deleted task."""
        self.is_deleted = False


# Deferred import for type hints
if TYPE_CHECKING:
    from src.models.column import Column
    from src.models.user import User
