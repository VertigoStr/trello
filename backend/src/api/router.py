"""
API router configuration with /api/auth prefix.
"""
from fastapi import APIRouter

# Create main router
router = APIRouter()

# Import and include auth routes (will be added later)
# from src.api.routes import auth
# router.include_router(auth.router, prefix="/api/auth", tags=["auth"])


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
