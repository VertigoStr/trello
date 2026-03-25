"""
Board service for CRUD operations on task boards.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, Tuple, List
from uuid import UUID
from datetime import datetime
import logging

from src.models.board import Board, BoardStatus
from src.models.board_member import BoardMember

logger = logging.getLogger(__name__)


class BoardService:
    """
    Service for board CRUD operations.
    
    Handles creation, retrieval, update, and deletion of boards
    with proper permission checks.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_board(
        self,
        owner_id: UUID,
        title: str,
        description: Optional[str] = None,
    ) -> Tuple[Board, BoardMember]:
        """
        Create a new board with owner.
        
        Args:
            owner_id: UUID of the board owner
            title: Board title (1-255 characters)
            description: Optional board description
        
        Returns:
            Tuple of (Board, BoardMember) - the created board and owner membership
        
        Raises:
            ValueError: If title is invalid
        """
        # Validate title
        if not title or len(title) > 255:
            raise ValueError("Title must be 1-255 characters")
        
        # Create board
        board = Board(
            title=title,
            description=description,
            owner_id=owner_id,
            status=BoardStatus.ACTIVE,
        )
        
        self.db.add(board)
        await self.db.flush()
        await self.db.refresh(board)
        
        # Create owner membership
        owner_member = BoardMember(
            board_id=board.id,
            user_id=owner_id,
            role="owner",
            permissions=["read", "write", "delete"],
        )
        
        self.db.add(owner_member)
        await self.db.flush()
        
        logger.info(f"Board created: {board.title} (id={board.id}, owner_id={owner_id})")
        
        return board, owner_member
    
    async def get_board(
        self,
        board_id: UUID,
    ) -> Optional[Board]:
        """
        Get board by ID.
        
        Args:
            board_id: Board UUID
        
        Returns:
            Board if found, None otherwise
        """
        result = await self.db.execute(
            select(Board).where(Board.id == board_id)
        )
        return result.scalar_one_or_none()
    
    async def get_boards_for_user(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 20,
        status: Optional[BoardStatus] = None,
    ) -> Tuple[List[Board], int]:
        """
        Get all boards for a user with pagination.
        
        Args:
            user_id: User UUID
            page: Page number (1-based)
            limit: Items per page
            status: Optional status filter
        
        Returns:
            Tuple of (list of boards, total count)
        """
        # Get boards where user is owner or member
        query = select(Board).join(
            BoardMember,
            Board.id == BoardMember.board_id,
        ).where(BoardMember.user_id == user_id)
        
        # Apply status filter
        if status:
            query = query.where(Board.status == status)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Board.created_at.desc())
        
        result = await self.db.execute(query)
        boards = result.scalars().all()
        
        return list(boards), total
    
    async def update_board(
        self,
        board_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Optional[Board]:
        """
        Update board settings.
        
        Args:
            board_id: Board UUID
            title: New title (optional)
            description: New description (optional)
        
        Returns:
            Updated board if found, None otherwise
        
        Raises:
            ValueError: If title is invalid
        """
        board = await self.get_board(board_id)
        
        if board is None:
            return None
        
        # Validate and update title
        if title is not None:
            if not title or len(title) > 255:
                raise ValueError("Title must be 1-255 characters")
            board.title = title
        
        # Update description
        if description is not None:
            board.description = description
        
        # Update timestamp
        board.updated_at = datetime.utcnow()
        
        await self.db.flush()
        await self.db.refresh(board)
        
        logger.info(f"Board updated: {board.title} (id={board.id})")
        
        return board
    
    async def delete_board(
        self,
        board_id: UUID,
    ) -> bool:
        """
        Delete board and all related data (cascade).
        
        Args:
            board_id: Board UUID
        
        Returns:
            True if deleted, False if not found
        """
        board = await self.get_board(board_id)
        
        if board is None:
            return False
        
        await self.db.delete(board)
        await self.db.flush()
        
        logger.info(f"Board deleted: {board.title} (id={board_id})")
        
        return True
    
    async def get_board_with_details(
        self,
        board_id: UUID,
    ) -> Optional[Board]:
        """
        Get board with columns and tasks.
        
        Args:
            board_id: Board UUID
        
        Returns:
            Board with relationships loaded if found, None otherwise
        """
        from sqlalchemy.orm import selectinload
        
        result = await self.db.execute(
            select(Board)
            .options(
                selectinload(Board.columns)
                .selectinload("tasks"),
                selectinload(Board.members),
            )
            .where(Board.id == board_id)
        )
        
        board = result.scalar_one_or_none()
        
        return board
