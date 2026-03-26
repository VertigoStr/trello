"""
Column service for CRUD operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime
import logging

from src.models.column import Column
from src.models.task import Task

logger = logging.getLogger(__name__)


class ColumnService:
    """Service for column operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_column(
        self,
        board_id: UUID,
        title: str,
    ) -> Column:
        """
        Create a new column.

        Args:
            board_id: Board UUID
            title: Column title

        Returns:
            Created column
        """
        # Get max position
        result = await self.db.execute(
            select(Column.position)
            .where(Column.board_id == board_id)
            .order_by(Column.position.desc())
        )
        max_position = result.scalar_one_or_none()
        new_position = (max_position or 0) + 1

        column = Column(
            board_id=board_id,
            title=title,
            position=new_position,
        )

        self.db.add(column)
        await self.db.flush()
        await self.db.refresh(column)

        logger.info(f"Column created: {column.id} (board={board_id})")
        return column

    async def get_columns(self, board_id: UUID) -> List[Column]:
        """
        Get all columns for a board.

        Args:
            board_id: Board UUID

        Returns:
            List of columns sorted by position
        """
        result = await self.db.execute(
            select(Column)
            .where(Column.board_id == board_id)
            .order_by(Column.position)
        )
        return list(result.scalars().all())

    async def get_column(self, column_id: UUID) -> Optional[Column]:
        """
        Get column by ID.

        Args:
            column_id: Column UUID

        Returns:
            Column or None
        """
        result = await self.db.execute(
            select(Column).where(Column.id == column_id)
        )
        return result.scalar_one_or_none()

    async def update_column(
        self,
        column_id: UUID,
        title: Optional[str] = None,
    ) -> Optional[Column]:
        """
        Update column.

        Args:
            column_id: Column UUID
            title: New title (optional)

        Returns:
            Updated column or None
        """
        column = await self.get_column(column_id)
        if not column:
            return None

        if title is not None:
            column.title = title

        column.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(column)

        logger.info(f"Column updated: {column.id}")
        return column

    async def delete_column(self, column_id: UUID) -> bool:
        """
        Delete column (cascade deletes tasks).

        Args:
            column_id: Column UUID

        Returns:
            True if deleted, False if not found
        """
        column = await self.get_column(column_id)
        if not column:
            return False

        board_id = column.board_id

        # Delete all tasks in column (cascade)
        await self.db.execute(
            Task.__table__.delete()
            .where(Task.column_id == column_id)
        )

        # Delete column
        await self.db.delete(column)
        await self.db.flush()

        # Reorder remaining columns
        await self._reorder_columns(board_id)

        logger.info(f"Column deleted: {column_id}")
        return True

    async def move_column(
        self,
        column_id: UUID,
        new_position: int,
    ) -> Optional[Column]:
        """
        Move column to new position.

        Args:
            column_id: Column UUID
            new_position: New position

        Returns:
            Updated column or None
        """
        column = await self.get_column(column_id)
        if not column:
            return None

        board_id = column.board_id
        old_position = column.position

        if old_position == new_position:
            return column

        # Get all columns for this board
        result = await self.db.execute(
            select(Column)
            .where(Column.board_id == board_id)
            .order_by(Column.position)
        )
        columns = list(result.scalars().all())

        # Remove column from list
        columns = [c for c in columns if c.id != column_id]

        # Insert at new position
        new_position = max(0, min(new_position, len(columns)))
        columns.insert(new_position, column)

        # Update positions
        for idx, col in enumerate(columns):
            col.position = idx
            if col.id != column_id:
                col.updated_at = datetime.utcnow()

        column.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(column)

        logger.info(f"Column moved: {column_id} (position={new_position})")
        return column

    async def _reorder_columns(self, board_id: UUID) -> None:
        """
        Reorder columns after deletion (compact gaps).

        Args:
            board_id: Board UUID
        """
        result = await self.db.execute(
            select(Column)
            .where(Column.board_id == board_id)
            .order_by(Column.position)
        )
        columns = list(result.scalars().all())

        for idx, column in enumerate(columns):
            if column.position != idx:
                column.position = idx

        await self.db.flush()
