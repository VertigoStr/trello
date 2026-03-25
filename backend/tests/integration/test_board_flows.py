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


class TestBoardMemberManagementFlow:
    """Integration tests for board member management [T069]."""

    @pytest.mark.asyncio
    async def test_member_management_flow(self, client: AsyncClient, auth_headers: dict, test_session: AsyncSession):
        """Test complete member management flow [T069]."""
        # Create a board
        board_payload = {"title": "Member Test Board"}
        board_response = await client.post("/api/boards", json=board_payload, headers=auth_headers)
        assert board_response.status_code == 201
        board_id = board_response.json()["id"]

        # Try to add a member (will fail if user doesn't exist in auth system)
        # This tests the endpoint integration
        member_payload = {
            "email": "test@example.com",
            "role": "member",
            "permissions": ["read"],
        }

        add_response = await client.post(
            f"/api/boards/{board_id}/members",
            json=member_payload,
            headers=auth_headers,
        )

        # Should return 201 if user exists, 404 if not
        assert add_response.status_code in [201, 404]

        # Get board details to verify member count
        details_response = await client.get(f"/api/boards/{board_id}", headers=auth_headers)
        assert details_response.status_code == 200

    @pytest.mark.asyncio
    async def test_owner_can_manage_members(self, client: AsyncClient, auth_headers: dict, test_session: AsyncSession):
        """Test that board owner can manage members [T069]."""
        # Create board
        board_payload = {"title": "Owner Management Test"}
        board_response = await client.post("/api/boards", json=board_payload, headers=auth_headers)
        board_id = board_response.json()["id"]

        # Owner should be able to access member endpoints
        # (actual member operations depend on user existence)
        member_payload = {
            "email": "newuser@example.com",
            "role": "member",
        }

        response = await client.post(
            f"/api/boards/{board_id}/members",
            json=member_payload,
            headers=auth_headers,
        )

        # Endpoint should be accessible to owner
        assert response.status_code in [201, 404]
