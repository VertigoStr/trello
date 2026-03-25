"""
API router configuration with /api/auth prefix.
"""
from fastapi import APIRouter
from src.api.routes.auth import router as auth_router
from src.api.routes.health import router as health_router
from src.api.routes.boards import router as boards_router

# Create main router
router = APIRouter()

# Include auth routes
router.include_router(auth_router)

# Include health routes
router.include_router(health_router)

# Include boards routes with /api prefix
router.include_router(boards_router, prefix="/api")


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
