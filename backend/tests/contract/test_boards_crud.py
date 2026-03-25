"""
Contract tests for boards CRUD endpoints.
Tests verify the API contract specification.
"""
import pytest
from httpx import AsyncClient


class TestCreateBoard:
    """Contract tests for POST /api/boards endpoint."""
    
    @pytest.mark.asyncio
    async def test_create_board_success(self, client: AsyncClient, auth_headers: dict):
        """Test successful board creation returns 201 with board data."""
        payload = {
            "title": "Test Board",
            "description": "Test description",
        }
        
        response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["title"] == "Test Board"
        assert data["description"] == "Test description"
        assert "owner_id" in data
        assert data["status"] == "active"
        assert "created_at" in data
        assert "updated_at" in data
    
    @pytest.mark.asyncio
    async def test_create_board_missing_title(self, client: AsyncClient, auth_headers: dict):
        """Test board creation without title returns 400."""
        payload = {
            "description": "Test description",
        }
        
        response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert "VALIDATION_ERROR" in data["error"]["code"]
    
    @pytest.mark.asyncio
    async def test_create_board_title_too_long(self, client: AsyncClient, auth_headers: dict):
        """Test board creation with title > 255 chars returns 400."""
        payload = {
            "title": "A" * 256,
            "description": "Test description",
        }
        
        response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
    
    @pytest.mark.asyncio
    async def test_create_board_unauthorized(self, client: AsyncClient):
        """Test board creation without auth returns 401."""
        payload = {
            "title": "Test Board",
        }
        
        response = await client.post("/api/boards", json=payload)
        
        assert response.status_code == 401


class TestListBoards:
    """Contract tests for GET /api/boards endpoint."""
    
    @pytest.mark.asyncio
    async def test_list_boards_success(self, client: AsyncClient, auth_headers: dict):
        """Test listing boards returns 200 with pagination."""
        response = await client.get("/api/boards", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "boards" in data
        assert "pagination" in data
        assert "page" in data["pagination"]
        assert "limit" in data["pagination"]
        assert "total" in data["pagination"]
    
    @pytest.mark.asyncio
    async def test_list_boards_with_pagination(self, client: AsyncClient, auth_headers: dict):
        """Test listing boards with pagination parameters."""
        response = await client.get("/api/boards?page=1&limit=10", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["limit"] == 10
    
    @pytest.mark.asyncio
    async def test_list_boards_unauthorized(self, client: AsyncClient):
        """Test listing boards without auth returns 401."""
        response = await client.get("/api/boards")
        
        assert response.status_code == 401


class TestGetBoard:
    """Contract tests for GET /api/boards/{id} endpoint."""
    
    @pytest.mark.asyncio
    async def test_get_board_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test getting non-existent board returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.get(f"/api/boards/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
        data = response.json()
        assert data["error"]["code"] == "BOARD_NOT_FOUND"
    
    @pytest.mark.asyncio
    async def test_get_board_unauthorized(self, client: AsyncClient):
        """Test getting board without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.get(f"/api/boards/{fake_id}")
        
        assert response.status_code == 401


class TestUpdateBoard:
    """Contract tests for PUT /api/boards/{id} endpoint."""
    
    @pytest.mark.asyncio
    async def test_update_board_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test updating non-existent board returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.put(f"/api/boards/{fake_id}", json={"title": "New Title"}, headers=auth_headers)
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_board_unauthorized(self, client: AsyncClient):
        """Test updating board without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.put(f"/api/boards/{fake_id}", json={"title": "New Title"})
        
        assert response.status_code == 401


class TestDeleteBoard:
    """Contract tests for DELETE /api/boards/{id} endpoint."""
    
    @pytest.mark.asyncio
    async def test_delete_board_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test deleting non-existent board returns 404."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.delete(f"/api/boards/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_board_unauthorized(self, client: AsyncClient):
        """Test deleting board without auth returns 401."""
        import uuid
        fake_id = str(uuid.uuid4())
        
        response = await client.delete(f"/api/boards/{fake_id}")
        
        assert response.status_code == 401
