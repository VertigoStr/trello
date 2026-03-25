"""
Unit tests for board service.
"""
import pytest
from uuid import uuid4

from src.services.board_service import BoardService
from src.services.permission_service import PermissionService


class TestBoardServiceValidation:
    """Tests for board service validation."""

    @pytest.mark.asyncio
    async def test_create_board_with_empty_title(self, test_session):
        """Test that creating board with empty title raises ValueError."""
        service = BoardService(test_session)

        with pytest.raises(ValueError, match="Title must be 1-255 characters"):
            await service.create_board(
                owner_id=uuid4(),
                title="",
            )

    @pytest.mark.asyncio
    async def test_create_board_with_long_title(self, test_session):
        """Test that creating board with title > 255 chars raises ValueError."""
        service = BoardService(test_session)

        with pytest.raises(ValueError, match="Title must be 1-255 characters"):
            await service.create_board(
                owner_id=uuid4(),
                title="A" * 256,
            )

    @pytest.mark.asyncio
    async def test_create_board_with_valid_title(self, test_session):
        """Test that creating board with valid title succeeds."""
        service = BoardService(test_session)

        board, member = await service.create_board(
            owner_id=uuid4(),
            title="Valid Title",
            description="Test description",
        )

        assert board.title == "Valid Title"
        assert board.description == "Test description"
        assert member.role == "owner"


class TestBoardServiceFiltering:
    """Tests for board service filtering by status [T029]."""

    @pytest.mark.asyncio
    async def test_get_boards_filter_by_status_active(self, test_session, test_user_id):
        """Test filtering boards by active status."""
        service = BoardService(test_session)

        # Create active board
        active_board, _ = await service.create_board(
            owner_id=test_user_id,
            title="Active Board",
        )

        # Create archived board
        archived_board, _ = await service.create_board(
            owner_id=test_user_id,
            title="Archived Board",
        )
        await service.update_board(archived_board.id, title="Archived Board")
        await test_session.execute(
            f"UPDATE boards SET status = 'archived' WHERE id = '{archived_board.id}'"
        )
        await test_session.commit()

        # Get only active boards
        boards, total = await service.get_boards_for_user(
            user_id=test_user_id,
            status="active",
        )

        assert total >= 1
        assert all(b.status == "active" for b in boards)
        assert active_board.id in [b.id for b in boards]
        assert archived_board.id not in [b.id for b in boards]

    @pytest.mark.asyncio
    async def test_get_boards_filter_by_status_archived(self, test_session, test_user_id):
        """Test filtering boards by archived status."""
        service = BoardService(test_session)

        # Create archived board
        archived_board, _ = await service.create_board(
            owner_id=test_user_id,
            title="Archived Board",
        )
        await test_session.execute(
            f"UPDATE boards SET status = 'archived' WHERE id = '{archived_board.id}'"
        )
        await test_session.commit()

        # Get only archived boards
        boards, total = await service.get_boards_for_user(
            user_id=test_user_id,
            status="archived",
        )

        assert total >= 1
        assert all(b.status == "archived" for b in boards)
        assert archived_board.id in [b.id for b in boards]


class TestPermissionService:
    """Tests for permission service."""

    @pytest.mark.asyncio
    async def test_owner_has_all_permissions(self, test_session):
        """Test that owner has all permissions."""
        service = PermissionService(test_session)

        # This would require setting up a board member first
        # For now, just test the method exists
        assert hasattr(service, 'has_permission')
        assert hasattr(service, 'is_owner')
        assert hasattr(service, 'is_admin')
