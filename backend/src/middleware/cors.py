"""
CORS middleware for frontend integration.
"""
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional


def setup_cors(app, allow_origins: Optional[List[str]] = None) -> None:
    """
    Configure CORS middleware for the application.
    
    Args:
        app: FastAPI application instance
        allow_origins: List of allowed origins (default: ["*"] for development)
    
    For production, specify exact origins:
        allow_origins=[
            "https://your-frontend.com",
            "https://www.your-frontend.com",
        ]
    """
    if allow_origins is None:
        # Development mode - allow all origins
        allow_origins = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    )
