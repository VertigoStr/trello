"""
Unit tests for permission service.
Tests cover access control scenarios [T038, T049, T059].
"""
import pytest
from uuid import uuid4
from sqlalchemy import insert

from src.services.permission_service import PermissionService
from src.services.board_service import BoardService
from src.models.board import Board
from src.models.board_member import BoardMember


class TestPermissionServiceAccessControl:
    """Tests for permission service access control [T038]."""

    @pytest.mark.asyncio
    async def test_access_denied_for_non_member(self, test_session, test_user_id):
        """Test that non-member cannot access board [T038]."""
        # Create a board owned by another user
        other_user_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=other_user_id,
            title="Private Board",
        )

        permission_service = PermissionService(test_session)

        # Check that test user has no access
        has_access = await permission_service.has_access(
            user_id=test_user_id,
            board_id=board.id,
            permission="read",
        )

        assert has_access is False

    @pytest.mark.asyncio
    async def test_access_allowed_for_member(self, test_session, test_user_id):
        """Test that member can access board."""
        # Create board and add user as member
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=test_user_id,
            title="Shared Board",
        )

        permission_service = PermissionService(test_session)

        # Owner should have access
        has_access = await permission_service.has_access(
            user_id=test_user_id,
            board_id=board.id,
            permission="read",
        )

        assert has_access is True

    @pytest.mark.asyncio
    async def test_member_read_permission(self, test_session, test_user_id):
        """Test that member with read permission can view board."""
        # Create board
        owner_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=owner_id,
            title="Team Board",
        )

        # Add user as member with read permission
        await test_session.execute(
            insert(BoardMember).values(
                board_id=board.id,
                user_id=test_user_id,
                role="member",
                permissions=["read"],
            )
        )
        await test_session.commit()

        permission_service = PermissionService(test_session)

        has_read = await permission_service.has_access(
            user_id=test_user_id,
            board_id=board.id,
            permission="read",
        )
        has_write = await permission_service.has_access(
            user_id=test_user_id,
            board_id=board.id,
            permission="write",
        )

        assert has_read is True
        assert has_write is False


class TestPermissionServiceOwnerOnly:
    """Tests for owner-only operations [T049, T059]."""

    @pytest.mark.asyncio
    async def test_non_owner_cannot_update_board(self, test_session, test_user_id):
        """Test that non-owner cannot update board settings [T049]."""
        # Create board owned by another user
        owner_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=owner_id,
            title="Owner Board",
        )

        permission_service = PermissionService(test_session)

        # Check that test user is not owner
        is_owner = await permission_service.is_owner(
            user_id=test_user_id,
            board_id=board.id,
        )

        assert is_owner is False

    @pytest.mark.asyncio
    async def test_non_owner_cannot_delete_board(self, test_session, test_user_id):
        """Test that non-owner cannot delete board [T059]."""
        # Create board owned by another user
        owner_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=owner_id,
            title="Owner Board",
        )

        permission_service = PermissionService(test_session)

        # Check that test user cannot delete (requires owner)
        can_delete = await permission_service.can_delete_board(
            user_id=test_user_id,
            board_id=board.id,
        )

        assert can_delete is False

    @pytest.mark.asyncio
    async def test_owner_can_update_board(self, test_session, test_user_id):
        """Test that owner can update board."""
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=test_user_id,
            title="My Board",
        )

        permission_service = PermissionService(test_session)

        is_owner = await permission_service.is_owner(
            user_id=test_user_id,
            board_id=board.id,
        )

        assert is_owner is True

    @pytest.mark.asyncio
    async def test_owner_can_delete_board(self, test_session, test_user_id):
        """Test that owner can delete board."""
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=test_user_id,
            title="My Board",
        )

        permission_service = PermissionService(test_session)

        can_delete = await permission_service.can_delete_board(
            user_id=test_user_id,
            board_id=board.id,
        )

        assert can_delete is True


class TestPermissionServiceAdmin:
    """Tests for admin role permissions."""

    @pytest.mark.asyncio
    async def test_admin_cannot_delete_board(self, test_session, test_user_id):
        """Test that admin cannot delete board (owner only)."""
        owner_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=owner_id,
            title="Admin Test Board",
        )

        # Add user as admin
        await test_session.execute(
            insert(BoardMember).values(
                board_id=board.id,
                user_id=test_user_id,
                role="admin",
                permissions=["read", "write"],
            )
        )
        await test_session.commit()

        permission_service = PermissionService(test_session)

        is_owner = await permission_service.is_owner(
            user_id=test_user_id,
            board_id=board.id,
        )
        can_delete = await permission_service.can_delete_board(
            user_id=test_user_id,
            board_id=board.id,
        )

        assert is_owner is False
        assert can_delete is False

    @pytest.mark.asyncio
    async def test_admin_has_write_permission(self, test_session, test_user_id):
        """Test that admin has write permissions."""
        owner_id = uuid4()
        board_service = BoardService(test_session)
        board, _ = await board_service.create_board(
            owner_id=owner_id,
            title="Admin Test Board",
        )

        # Add user as admin
        await test_session.execute(
            insert(BoardMember).values(
                board_id=board.id,
                user_id=test_user_id,
                role="admin",
                permissions=["read", "write"],
            )
        )
        await test_session.commit()

        permission_service = PermissionService(test_session)

        has_write = await permission_service.has_access(
            user_id=test_user_id,
            board_id=board.id,
            permission="write",
        )

        assert has_write is True
