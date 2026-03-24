"""
Request ID middleware for tracing and logging.
"""
from fastapi import Request
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import uuid


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds a unique request ID to each request.
    
    The request ID is:
    - Generated if not present in headers
    - Added to request state for access in handlers
    - Included in response headers
    - Logged with each log message for tracing
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Get or generate request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Add to request state
        request.state.request_id = request_id
        
        # Process request
        response = await call_next(request)
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        return response


def get_request_id(request: Request) -> str:
    """
    Get request ID from request state.
    
    Usage:
        @router.get("/")
        async def get_something(request: Request):
            request_id = get_request_id(request)
            logger.info(f"[{request_id}] Processing request")
    """
    return getattr(request.state, "request_id", "unknown")
