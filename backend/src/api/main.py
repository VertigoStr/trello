"""
FastAPI application factory.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.db.database import init_db, close_db
from src.api.router import router
from src.middleware.error_handler import ErrorHandlerMiddleware
from src.middleware.request_id import RequestIDMiddleware
from src.middleware.cors import setup_cors
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting up application...")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await close_db()
    logger.info("Database connections closed")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    """
    app = FastAPI(
        title="Trello Clone API",
        description="Authentication and Registration API",
        version="0.1.0",
        lifespan=lifespan,
    )
    
    # Add CORS middleware
    setup_cors(app)
    
    # Add request ID middleware
    app.add_middleware(RequestIDMiddleware)
    
    # Add error handler middleware
    app.add_middleware(ErrorHandlerMiddleware)
    
    # Include routers
    app.include_router(router)
    
    return app


# Create application instance
app = create_app()
