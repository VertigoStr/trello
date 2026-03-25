"""
Integration tests for task flows.
Tests verify complete user journeys.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.task import Task
from src.models.column import Column


class TestTaskCreationFlow:
    """Integration tests for task creation flow."""

    @pytest.mark.asyncio
    async def test_create_task_creates_in_database(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that creating a task actually creates it in the database."""
        payload = {
            "title": "Integration Test Task",
            "description": "Integration test description",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        task_id = response.json()["id"]

        # Verify task exists in database
        result = await test_session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        assert task is not None
        assert task.title == "Integration Test Task"
        assert task.description == "Integration test description"

    @pytest.mark.asyncio
    async def test_create_task_default_assignee(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
        test_user_id: str,
    ):
        """Test that creating a task assigns creator as default assignee."""
        payload = {
            "title": "Default Assignee Task",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        task_id = response.json()["id"]

        # Verify assignee is creator
        result = await test_session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()

        assert task is not None
        assert task.assignee_id == test_user_id

    @pytest.mark.asyncio
    async def test_create_task_position_management(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that creating multiple tasks assigns correct positions."""
        # Create first task
        payload1 = {"title": "Task 1"}
        response1 = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload1,
            headers=auth_headers,
        )
        assert response1.status_code == 201
        position1 = response1.json()["position"]

        # Create second task
        payload2 = {"title": "Task 2"}
        response2 = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload2,
            headers=auth_headers,
        )
        assert response2.status_code == 201
        position2 = response2.json()["position"]

        # Verify positions are in order
        assert position1 < position2


class TestTaskListFlow:
    """Integration tests for task listing flow."""

    @pytest.mark.asyncio
    async def test_list_tasks_returns_tasks(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that listing tasks returns created tasks."""
        # Create a task first
        payload = {"title": "List Test Task"}
        create_response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )
        assert create_response.status_code == 201

        # List tasks
        list_response = await client.get(
            "/api/boards/test-board/tasks",
            headers=auth_headers,
        )

        assert list_response.status_code == 200
        data = list_response.json()

        assert len(data["tasks"]) >= 1
        task_ids = [t["id"] for t in data["tasks"]]
        assert create_response.json()["id"] in task_ids

    @pytest.mark.asyncio
    async def test_list_tasks_pagination(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that pagination works correctly."""
        # Create multiple tasks
        for i in range(5):
            payload = {"title": f"Task {i}"}
            await client.post(
                f"/api/boards/test-board/columns/{test_column_id}/tasks",
                json=payload,
                headers=auth_headers,
            )

        # List with limit
        response = await client.get(
            "/api/boards/test-board/tasks?limit=3",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert data["pagination"]["limit"] == 3
        assert len(data["tasks"]) <= 3
        assert data["pagination"]["total"] >= 5


class TestTaskUpdateFlow:
    """Integration tests for task update flow."""

    @pytest.mark.asyncio
    async def test_update_task_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that updating a task works correctly."""
        # Create a task
        payload = {"title": "Original Title"}
        create_response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )
        task_id = create_response.json()["id"]
        version = create_response.json()["version"]

        # Update the task
        update_payload = {"title": "Updated Title"}
        update_response = await client.put(
            f"/api/tasks/{task_id}",
            json=update_payload,
            headers={**auth_headers, "If-Match": f'"{version}"'},
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "Updated Title"
        assert data["version"] == version + 1

    @pytest.mark.asyncio
    async def test_update_task_optimistic_locking(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that optimistic locking detects conflicts."""
        # Create a task
        payload = {"title": "Original Title"}
        create_response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )
        task_id = create_response.json()["id"]
        old_version = create_response.json()["version"]

        # Update once (simulating another user)
        await client.put(
            f"/api/tasks/{task_id}",
            json={"title": "Concurrent Update"},
            headers={**auth_headers, "If-Match": f'"{old_version}"'},
        )

        # Try to update with old version (should fail)
        update_response = await client.put(
            f"/api/tasks/{task_id}",
            json={"title": "My Update"},
            headers={**auth_headers, "If-Match": f'"{old_version}"'},
        )

        assert update_response.status_code == 412
        data = update_response.json()
        assert "detail" in data
        assert data["detail"]["code"] == "CONFLICT"


class TestTaskMoveFlow:
    """Integration tests for task move flow."""

    @pytest.mark.asyncio
    async def test_move_task_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that moving a task works correctly."""
        from src.models.column import Column

        # Create a task
        payload = {"title": "Task to Move"}
        create_response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )
        task_id = create_response.json()["id"]

        # Create another column
        column_payload = {"title": "New Column", "position": 2}
        column_response = await client.post(
            "/api/boards/test-board/columns",
            json=column_payload,
            headers=auth_headers,
        )
        new_column_id = column_response.json()["id"]

        # Move the task
        move_payload = {"column_id": new_column_id}
        move_response = await client.post(
            f"/api/tasks/{task_id}/move",
            json=move_payload,
            headers=auth_headers,
        )

        assert move_response.status_code == 200
        data = move_response.json()
        assert data["column_id"] == new_column_id

        # Verify in database
        result = await test_session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()
        assert task is not None
        assert str(task.column_id) == new_column_id


class TestTaskDeleteFlow:
    """Integration tests for task delete flow."""

    @pytest.mark.asyncio
    async def test_delete_task_soft_delete(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_session: AsyncSession,
        test_column_id: str,
    ):
        """Test that deleting a task performs soft delete."""
        # Create a task
        payload = {"title": "Task to Delete"}
        create_response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )
        task_id = create_response.json()["id"]

        # Delete the task
        delete_response = await client.delete(
            f"/api/tasks/{task_id}",
            headers=auth_headers,
        )

        assert delete_response.status_code == 204

        # Verify soft delete in database
        result = await test_session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()
        assert task is not None
        assert task.is_deleted == True

        # Verify task is not returned in list
        list_response = await client.get(
            "/api/boards/test-board/tasks",
            headers=auth_headers,
        )
        task_ids = [t["id"] for t in list_response.json()["tasks"]]
        assert task_id not in task_ids
