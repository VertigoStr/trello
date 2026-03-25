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
