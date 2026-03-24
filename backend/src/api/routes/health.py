"""
Health check endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime
import logging

from src.db.connection import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Health check endpoint.
    
    Returns:
    - **status**: Overall health status
    - **timestamp**: Current timestamp
    - **database**: Database connection status
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "unknown",
    }
    
    # Check database connection
    try:
        await db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["database"] = "disconnected"
        health_status["status"] = "unhealthy"
    
    return health_status


@router.get("/ready")
async def readiness_check() -> dict:
    """
    Readiness check endpoint.
    
    Returns:
    - **ready**: Whether the service is ready to accept traffic
    """
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/live")
async def liveness_check() -> dict:
    """
    Liveness check endpoint.
    
    Returns:
    - **alive**: Whether the service is alive
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat(),
    }
