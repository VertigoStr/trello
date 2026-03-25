"""
Column model for organizing tasks on a board.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from uuid import UUID

from src.db.base import BaseModel


class Column(BaseModel):
    """
    Column model for task boards.
    
    Represents a column on a board that contains tasks.
    Columns are ordered by position within a board.
    """
    
    __tablename__ = "columns"
    
    # Board reference
    board_id: Mapped[UUID] = mapped_column(
        ForeignKey("columns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Column title (required, 1-255 characters)
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    # Position in the board (0-based index)
    position: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )
    
    # Relationships
    board: Mapped["Board"] = relationship(
        "Board",
        back_populates="columns",
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="column",
        cascade="all, delete-orphan",
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_columns_board_id", "board_id"),
        Index("idx_columns_position", "position"),
    )
    
    def __repr__(self) -> str:
        return f"<Column(id={self.id}, title='{self.title}', board_id={self.board_id})>"


# Deferred import for type hints
if TYPE_CHECKING:
    from src.models.board import Board
    from src.models.task import Task
