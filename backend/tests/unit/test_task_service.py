"""
Unit tests for task service.
"""
import pytest
from uuid import uuid4

from src.services.task_service import TaskService


class TestTaskServiceValidation:
    """Tests for task service validation."""

    @pytest.mark.asyncio
    async def test_create_task_with_empty_title(self, test_session):
        """Test that creating task with empty title raises ValueError."""
        service = TaskService(test_session)

        with pytest.raises(ValueError, match="Title must be 1-255 characters"):
            await service.create_task(
                column_id=uuid4(),
                title="",
                creator_id=uuid4(),
            )

    @pytest.mark.asyncio
    async def test_create_task_with_long_title(self, test_session):
        """Test that creating task with title > 255 chars raises ValueError."""
        service = TaskService(test_session)

        with pytest.raises(ValueError, match="Title must be 1-255 characters"):
            await service.create_task(
                column_id=uuid4(),
                title="A" * 256,
                creator_id=uuid4(),
            )

    @pytest.mark.asyncio
    async def test_create_task_with_valid_title(self, test_session):
        """Test that creating task with valid title succeeds."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        task = await service.create_task(
            column_id=column_id,
            title="Valid Title",
            creator_id=creator_id,
            description="Test description",
        )

        assert task.title == "Valid Title"
        assert task.description == "Test description"
        assert task.assignee_id == creator_id  # Default assignee
        assert task.version == 1


class TestTaskServicePosition:
    """Tests for task position management."""

    @pytest.mark.asyncio
    async def test_create_task_first_position(self, test_session):
        """Test that first task gets position 1.0."""
        service = TaskService(test_session)
        column_id = uuid4()

        task = await service.create_task(
            column_id=column_id,
            title="First Task",
            creator_id=uuid4(),
        )

        assert task.position == 1.0

    @pytest.mark.asyncio
    async def test_create_task_subsequent_position(self, test_session):
        """Test that subsequent tasks get incrementing positions."""
        service = TaskService(test_session)
        column_id = uuid4()

        task1 = await service.create_task(
            column_id=column_id,
            title="Task 1",
            creator_id=uuid4(),
        )

        task2 = await service.create_task(
            column_id=column_id,
            title="Task 2",
            creator_id=uuid4(),
        )

        assert task1.position < task2.position


class TestTaskServiceUpdate:
    """Tests for task update with optimistic locking."""

    @pytest.mark.asyncio
    async def test_update_task_success(self, test_session):
        """Test successful task update."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        # Create task
        task = await service.create_task(
            column_id=column_id,
            title="Original",
            creator_id=creator_id,
        )
        original_version = task.version

        # Update task
        updated_task, conflict = await service.update_task(
            task_id=task.id,
            title="Updated",
            version=original_version,
        )

        assert updated_task is not None
        assert conflict is False
        assert updated_task.title == "Updated"
        assert updated_task.version == original_version + 1

    @pytest.mark.asyncio
    async def test_update_task_conflict(self, test_session):
        """Test optimistic locking conflict detection."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        # Create task
        task = await service.create_task(
            column_id=column_id,
            title="Original",
            creator_id=creator_id,
        )

        # Update once
        await service.update_task(
            task_id=task.id,
            title="First Update",
            version=task.version,
        )

        # Try to update with old version (should conflict)
        updated_task, conflict = await service.update_task(
            task_id=task.id,
            title="Second Update",
            version=task.version,  # Old version
        )

        assert updated_task is None
        assert conflict is True


class TestTaskServiceMove:
    """Tests for task move operation."""

    @pytest.mark.asyncio
    async def test_move_task_not_found(self, test_session):
        """Test moving non-existent task returns None."""
        service = TaskService(test_session)

        result = await service.move_task(
            task_id=uuid4(),
            column_id=uuid4(),
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_move_task_success(self, test_session):
        """Test successful task move."""
        from src.models.column import Column

        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        # Create task
        task = await service.create_task(
            column_id=column_id,
            title="Task to Move",
            creator_id=creator_id,
        )

        # Move task (to same column for simplicity)
        moved_task = await service.move_task(
            task_id=task.id,
            column_id=column_id,
            position=2.5,
        )

        assert moved_task is not None
        assert moved_task.position == 2.5


class TestTaskServiceDelete:
    """Tests for task soft delete."""

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, test_session):
        """Test deleting non-existent task returns False."""
        service = TaskService(test_session)

        result = await service.delete_task(task_id=uuid4())

        assert result is False

    @pytest.mark.asyncio
    async def test_delete_task_success(self, test_session):
        """Test successful task soft delete."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        # Create task
        task = await service.create_task(
            column_id=column_id,
            title="Task to Delete",
            creator_id=creator_id,
        )

        # Delete task
        deleted = await service.delete_task(task_id=task.id)

        assert deleted is True

        # Verify task is not returned by get_task
        retrieved = await service.get_task(task_id=task.id)
        assert retrieved is None


class TestTaskServiceUnassign:
    """Tests for task unassign operation."""

    @pytest.mark.asyncio
    async def test_unassign_task_not_assignee(self, test_session):
        """Test unassigning when user is not assignee returns None."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()
        other_user_id = uuid4()

        # Create task with creator as assignee
        task = await service.create_task(
            column_id=column_id,
            title="Task",
            creator_id=creator_id,
        )

        # Try to unassign other user
        result = await service.unassign_task(
            task_id=task.id,
            user_id=other_user_id,
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_unassign_task_success(self, test_session):
        """Test successful task unassign."""
        service = TaskService(test_session)
        column_id = uuid4()
        creator_id = uuid4()

        # Create task
        task = await service.create_task(
            column_id=column_id,
            title="Task",
            creator_id=creator_id,
        )

        # Unassign
        unassigned = await service.unassign_task(
            task_id=task.id,
            user_id=creator_id,
        )

        assert unassigned is not None
        assert unassigned.assignee_id is None
