"""
API router configuration with /api/auth prefix.
"""
from fastapi import APIRouter
from src.api.routes.auth import router as auth_router

# Create main router
router = APIRouter()

# Include auth routes
router.include_router(auth_router)


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Trello Clone API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@router.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "name": "Trello Clone API",
        "version": "0.1.0",
        "endpoints": {
            "auth": "/api/auth",
            "docs": "/docs",
            "health": "/health",
        },
    }
