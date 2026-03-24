"""
Error handling middleware with standard error response format.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ErrorResponse:
    """Standard error response format."""

    def __init__(
        self,
        error: dict,
        status: str = "error",
    ):
        self.status = status
        self.error = error
    
    def dict(self) -> dict:
        return {
            "status": self.status,
            "error": self.error,
        }


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handler middleware."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except HTTPException as exc:
            return await self._handle_http_exception(exc)
        except Exception as exc:
            return await self._handle_generic_exception(exc)
    
    async def _handle_http_exception(self, exc: HTTPException) -> JSONResponse:
        """Handle HTTP exceptions."""
        error_response = ErrorResponse(
            error={
                "code": self._get_error_code(exc.status_code),
                "message": exc.detail,
            }
        )
        
        logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.dict(),
        )
    
    async def _handle_generic_exception(self, exc: Exception) -> JSONResponse:
        """Handle generic exceptions."""
        error_response = ErrorResponse(
            error={
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
            }
        )
        
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        
        return JSONResponse(
            status_code=500,
            content=error_response.dict(),
        )
    
    def _get_error_code(self, status_code: int) -> str:
        """Map status code to error code."""
        codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
            423: "LOCKED",
            500: "INTERNAL_ERROR",
        }
        return codes.get(status_code, "UNKNOWN_ERROR")
