"""
Task service for CRUD operations on tasks.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import StaleDataError
from typing import Optional, Tuple, List
from uuid import UUID
from datetime import datetime
import logging

from src.models.task import Task
from src.models.column import Column

logger = logging.getLogger(__name__)


class TaskService:
    """
    Service for task CRUD operations.

    Handles creation, retrieval, update, and deletion of tasks
    with proper permission checks and optimistic locking.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_task(
        self,
        column_id: UUID,
        title: str,
        creator_id: UUID,
        description: Optional[str] = None,
        assignee_id: Optional[UUID] = None,
    ) -> Task:
        """
        Create a new task in a column.

        Args:
            column_id: UUID of the target column
            title: Task title (1-255 characters)
            creator_id: UUID of the task creator (default assignee)
            description: Optional task description
            assignee_id: Optional assignee (defaults to creator)

        Returns:
            Created Task instance

        Raises:
            ValueError: If title is invalid
        """
        # Validate title
        if not title or len(title) > 255:
            raise ValueError("Title must be 1-255 characters")

        # Get the last position in the column
        result = await self.db.execute(
            select(func.max(Task.position)).where(Task.column_id == column_id)
        )
        max_position = result.scalar()
        new_position = (max_position or 0) + 1.0

        # Default assignee to creator if not specified
        if assignee_id is None:
            assignee_id = creator_id

        # Create task
        task = Task(
            column_id=column_id,
            title=title,
            description=description,
            position=new_position,
            assignee_id=assignee_id,
            version=1,
        )

        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task)

        logger.info(
            f"Task created: {task.title} (id={task.id}, column_id={column_id}, assignee_id={assignee_id})"
        )

        return task

    async def get_task(
        self,
        task_id: UUID,
    ) -> Optional[Task]:
        """
        Get task by ID.

        Args:
            task_id: Task UUID

        Returns:
            Task if found, None otherwise
        """
        result = await self.db.execute(
            select(Task).where(
                Task.id == task_id,
                Task.is_deleted == False
            )
        )
        return result.scalar_one_or_none()

    async def list_tasks(
        self,
        column_id: Optional[UUID] = None,
        assignee_id: Optional[UUID] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Task], int]:
        """
        List tasks with optional filtering and pagination.

        Args:
            column_id: Optional filter by column
            assignee_id: Optional filter by assignee
            page: Page number (1-based)
            limit: Items per page

        Returns:
            Tuple of (list of tasks, total count)
        """
        # Build query
        query = select(Task).where(Task.is_deleted == False)

        # Apply filters
        if column_id:
            query = query.where(Task.column_id == column_id)
        if assignee_id:
            query = query.where(Task.assignee_id == assignee_id)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination and sorting
        offset = (page - 1) * limit
        query = query.order_by(Task.position.asc()).offset(offset).limit(limit)

        result = await self.db.execute(query)
        tasks = result.scalars().all()

        return list(tasks), total

    async def update_task(
        self,
        task_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        assignee_id: Optional[UUID] = None,
        version: Optional[int] = None,
    ) -> Tuple[Optional[Task], bool]:
        """
        Update task with optimistic locking.

        Args:
            task_id: Task UUID
            title: New title (optional)
            description: New description (optional)
            assignee_id: New assignee (optional)
            version: Expected version for optimistic locking

        Returns:
            Tuple of (updated task or None, conflict_detected)
            
            If conflict_detected is True, task is None and caller should
            refresh data and retry.
        """
        task = await self.get_task(task_id)

        if task is None:
            return None, False

        # Check version for optimistic locking
        if version is not None and task.version != version:
            logger.warning(
                f"Optimistic lock conflict for task {task_id}: "
                f"expected version {version}, got {task.version}"
            )
            return None, True

        # Update fields
        if title is not None:
            if not title or len(title) > 255:
                raise ValueError("Title must be 1-255 characters")
            task.title = title

        if description is not None:
            task.description = description

        if assignee_id is not None:
            task.assignee_id = assignee_id

        # Update timestamp
        task.updated_at = datetime.utcnow()

        # Version will be auto-incremented by SQLAlchemy

        await self.db.flush()
        await self.db.refresh(task)

        logger.info(f"Task updated: {task.title} (id={task.id})")

        return task, False

    async def move_task(
        self,
        task_id: UUID,
        column_id: UUID,
        position: Optional[float] = None,
    ) -> Optional[Task]:
        """
        Move task to a different column and/or position.

        Args:
            task_id: Task UUID
            column_id: Target column UUID
            position: Target position (float). If None, appends to end.

        Returns:
            Updated Task if successful, None if task not found
        """
        task = await self.get_task(task_id)

        if task is None:
            return None

        # Verify target column exists
        column_result = await self.db.execute(
            select(Column).where(Column.id == column_id)
        )
        column = column_result.scalar_one_or_none()

        if column is None:
            return None

        # Calculate position if not specified
        if position is None:
            result = await self.db.execute(
                select(func.max(Task.position)).where(Task.column_id == column_id)
            )
            max_position = result.scalar()
            position = (max_position or 0) + 1.0

        # Update task
        task.column_id = column_id
        task.position = position
        task.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(task)

        logger.info(f"Task moved: {task.title} (id={task.id}, column_id={column_id})")

        return task

    async def delete_task(
        self,
        task_id: UUID,
    ) -> bool:
        """
        Soft delete a task.

        Args:
            task_id: Task UUID

        Returns:
            True if deleted, False if not found
        """
        task = await self.get_task(task_id)

        if task is None:
            return False

        task.soft_delete()
        task.updated_at = datetime.utcnow()

        await self.db.flush()

        logger.info(f"Task deleted: {task.title} (id={task_id})")

        return True

    async def unassign_task(
        self,
        task_id: UUID,
        user_id: UUID,
    ) -> Optional[Task]:
        """
        Unassign a user from a task (only if they are the assignee).

        Args:
            task_id: Task UUID
            user_id: User UUID to unassign

        Returns:
            Updated Task if successful, None if not assignee
        """
        task = await self.get_task(task_id)

        if task is None:
            return None

        # Only assignee can unassign themselves
        if task.assignee_id != user_id:
            return None

        task.assignee_id = None
        task.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(task)

        logger.info(f"Task unassigned: {task.title} (id={task_id})")

        return task

    async def renumber_positions(
        self,
        column_id: UUID,
    ) -> int:
        """
        Renumber task positions in a column to ensure proper ordering.

        This is useful when float precision issues arise from repeated
        insertions between positions.

        Args:
            column_id: UUID of the column to renumber

        Returns:
            Number of tasks renumbered
        """
        result = await self.db.execute(
            select(Task)
            .where(Task.column_id == column_id, Task.is_deleted == False)
            .order_by(Task.position.asc())
        )
        tasks = result.scalars().all()

        # Renumber tasks with integer positions (1.0, 2.0, 3.0, ...)
        for i, task in enumerate(tasks, 1):
            task.position = float(i)

        await self.db.flush()

        logger.info(f"Renumbered {len(tasks)} tasks in column {column_id}")

        return len(tasks)
