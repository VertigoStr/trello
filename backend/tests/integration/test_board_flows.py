"""
Integration tests for board flows.
Tests verify complete user journeys.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.board import Board
from src.models.board_member import BoardMember


class TestBoardCreationFlow:
    """Integration tests for board creation flow."""
    
    @pytest.mark.asyncio
    async def test_create_board_creates_in_database(self, client: AsyncClient, auth_headers: dict, test_session: AsyncSession):
        """Test that creating a board actually creates it in the database."""
        payload = {
            "title": "Integration Test Board",
            "description": "Integration test description",
        }
        
        response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        board_id = response.json()["id"]
        
        # Verify board exists in database
        result = await test_session.execute(
            select(Board).where(Board.id == board_id)
        )
        board = result.scalar_one_or_none()
        
        assert board is not None
        assert board.title == "Integration Test Board"
        assert board.description == "Integration test description"
    
    @pytest.mark.asyncio
    async def test_create_board_creates_owner_member(self, client: AsyncClient, auth_headers: dict, test_session: AsyncSession):
        """Test that creating a board creates owner membership."""
        payload = {
            "title": "Owner Test Board",
        }
        
        response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert response.status_code == 201
        board_id = response.json()["id"]
        user_id = response.json()["owner_id"]
        
        # Verify owner membership exists
        result = await test_session.execute(
            select(BoardMember).where(
                BoardMember.board_id == board_id,
                BoardMember.user_id == user_id,
            )
        )
        member = result.scalar_one_or_none()
        
        assert member is not None
        assert member.role == "owner"
        assert "read" in member.permissions
        assert "write" in member.permissions
        assert "delete" in member.permissions


class TestBoardListFlow:
    """Integration tests for board listing flow."""
    
    @pytest.mark.asyncio
    async def test_list_boards_returns_user_boards(self, client: AsyncClient, auth_headers: dict, test_session: AsyncSession):
        """Test that listing boards returns only user's boards."""
        # Create a board first
        payload = {"title": "List Test Board"}
        create_response = await client.post("/api/boards", json=payload, headers=auth_headers)
        
        assert create_response.status_code == 201
        
        # List boards
        list_response = await client.get("/api/boards", headers=auth_headers)
        
        assert list_response.status_code == 200
        data = list_response.json()
        
        assert len(data["boards"]) >= 1
        board_ids = [b["id"] for b in data["boards"]]
        assert create_response.json()["id"] in board_ids
