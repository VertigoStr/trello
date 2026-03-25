"""
Contract tests for tasks CRUD endpoints.
Tests verify the API contract specification.
"""
import pytest
from httpx import AsyncClient


class TestCreateTask:
    """Contract tests for POST /api/boards/{board_id}/columns/{column_id}/tasks endpoint."""

    @pytest.mark.asyncio
    async def test_create_task_success(self, client: AsyncClient, auth_headers: dict, test_column_id: str):
        """Test successful task creation returns 201 with task data."""
        payload = {
            "title": "Test Task",
            "description": "Test description",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()

        assert "id" in data
        assert data["title"] == "Test Task"
        assert data["description"] == "Test description"
        assert "column_id" in data
        assert "assignee_id" in data
        assert "position" in data
        assert data["version"] == 1

    @pytest.mark.asyncio
    async def test_create_task_missing_title(self, client: AsyncClient, auth_headers: dict, test_column_id: str):
        """Test task creation without title returns 400."""
        payload = {
            "description": "Test description",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_create_task_title_too_long(self, client: AsyncClient, auth_headers: dict, test_column_id: str):
        """Test task creation with title > 255 chars returns 400."""
        payload = {
            "title": "A" * 256,
            "description": "Test description",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_create_task_with_assignee(self, client: AsyncClient, auth_headers: dict, test_column_id: str, test_user_id: str):
        """Test task creation with assignee returns 201."""
        payload = {
            "title": "Assigned Task",
            "assignee_id": test_user_id,
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["assignee_id"] == test_user_id

    @pytest.mark.asyncio
    async def test_create_task_unauthorized(self, client: AsyncClient, test_column_id: str):
        """Test task creation without auth returns 401."""
        payload = {
            "title": "Test Task",
        }

        response = await client.post(
            f"/api/boards/test-board/columns/{test_column_id}/tasks",
            json=payload,
        )

        assert response.status_code == 401


class TestListTasks:
    """Contract tests for GET /api/boards/{board_id}/tasks endpoint."""

    @pytest.mark.asyncio
    async def test_list_tasks_success(self, client: AsyncClient, auth_headers: dict):
        """Test listing tasks returns 200 with pagination."""
        response = await client.get(
            "/api/boards/test-board/tasks",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert "tasks" in data
        assert "pagination" in data
        assert "page" in data["pagination"]
        assert "limit" in data["pagination"]
        assert "total" in data["pagination"]

    @pytest.mark.asyncio
    async def test_list_tasks_with_pagination(self, client: AsyncClient, auth_headers: dict):
        """Test listing tasks with pagination parameters."""
        response = await client.get(
            "/api/boards/test-board/tasks?page=1&limit=10",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert data["pagination"]["page"] == 1
        assert data["pagination"]["limit"] == 10

    @pytest.mark.asyncio
    async def test_list_tasks_unauthorized(self, client: AsyncClient):
        """Test listing tasks without auth returns 401."""
        response = await client.get("/api/boards/test-board/tasks")

        assert response.status_code == 401


class TestGetTask:
    """Contract tests for GET /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_task_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test getting non-existent task returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.get(f"/api/tasks/{fake_id}", headers=auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_task_unauthorized(self, client: AsyncClient):
        """Test getting task without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.get(f"/api/tasks/{fake_id}")

        assert response.status_code == 401


class TestUpdateTask:
    """Contract tests for PUT /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_task_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test updating non-existent task returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.put(
            f"/api/tasks/{fake_id}",
            json={"title": "New Title"},
            headers=auth_headers,
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_task_unauthorized(self, client: AsyncClient):
        """Test updating task without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.put(
            f"/api/tasks/{fake_id}",
            json={"title": "New Title"},
        )

        assert response.status_code == 401


class TestMoveTask:
    """Contract tests for POST /api/tasks/{task_id}/move endpoint."""

    @pytest.mark.asyncio
    async def test_move_task_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test moving non-existent task returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.post(
            f"/api/tasks/{fake_id}/move",
            json={"column_id": str(uuid.uuid4())},
            headers=auth_headers,
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_move_task_unauthorized(self, client: AsyncClient):
        """Test moving task without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.post(
            f"/api/tasks/{fake_id}/move",
            json={"column_id": str(uuid.uuid4())},
        )

        assert response.status_code == 401


class TestDeleteTask:
    """Contract tests for DELETE /api/tasks/{task_id} endpoint."""

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test deleting non-existent task returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.delete(f"/api/tasks/{fake_id}", headers=auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_task_unauthorized(self, client: AsyncClient):
        """Test deleting task without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.delete(f"/api/tasks/{fake_id}")

        assert response.status_code == 401


class TestUnassignTask:
    """Contract tests for POST /api/tasks/{task_id}/unassign endpoint."""

    @pytest.mark.asyncio
    async def test_unassign_task_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test unassigning from non-existent task returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.post(f"/api/tasks/{fake_id}/unassign", headers=auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_unassign_task_unauthorized(self, client: AsyncClient):
        """Test unassigning without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())

        response = await client.post(f"/api/tasks/{fake_id}/unassign")

        assert response.status_code == 401
