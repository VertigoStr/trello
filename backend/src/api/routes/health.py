"""
Health check endpoints for boards API.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
from datetime import datetime
import logging

from src.db.connection import get_db
from src.models.board import Board
from src.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health/boards")
async def health_check_boards(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Health check for boards API.
    
    Returns:
    - **status**: Overall health status
    - **timestamp**: Current timestamp
    - **database**: Database connection status
    - **stats**: Board statistics
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "unknown",
        "stats": {
            "total_boards": 0,
            "active_boards": 0,
        },
    }
    
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
        
        # Get board statistics
        total_result = await db.execute(select(func.count()).select_from(Board))
        health_status["stats"]["total_boards"] = total_result.scalar() or 0
        
        active_result = await db.execute(
            select(func.count()).select_from(Board).where(Board.status == "active")
        )
        health_status["stats"]["active_boards"] = active_result.scalar() or 0
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
        health_status["error"] = str(e)
    
    return health_status


@router.get("/health/users")
async def health_check_users(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Health check for users API.
    
    Returns:
    - **status**: Overall health status
    - **timestamp**: Current timestamp
    - **database**: Database connection status
    - **stats**: User statistics
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "unknown",
        "stats": {
            "total_users": 0,
            "active_users": 0,
        },
    }
    
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
        
        # Get user statistics
        total_result = await db.execute(select(func.count()).select_from(User))
        health_status["stats"]["total_users"] = total_result.scalar() or 0
        
        active_result = await db.execute(
            select(func.count()).select_from(User).where(User.is_active == True)
        )
        health_status["stats"]["active_users"] = active_result.scalar() or 0
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
        health_status["error"] = str(e)
    
    return health_status
