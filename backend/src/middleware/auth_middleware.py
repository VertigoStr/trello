"""
JWT authentication middleware for token validation.
"""
import os

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from uuid import UUID
import logging

from src.db.connection import get_db
from src.services.jwt_service import jwt_service, JWTService
from src.middleware.rate_limiter import login_rate_limiter
from src.models.token import AccessToken

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token.
    
    Usage:
        @router.post("/protected")
        async def protected_route(
            current_user: dict = Depends(get_current_user)
        ):
            user_id = current_user["user_id"]
            email = current_user["email"]
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "MISSING_TOKEN",
                "message": "Authorization token is required",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Decode and validate token
        payload = jwt_service.decode_token(token)
        
        # Check token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "INVALID_TOKEN_TYPE",
                    "message": "Invalid token type",
                },
            )
        
        # Extract user info
        user_id = UUID(payload["sub"])
        email = payload["email"]
        name = payload.get("name", "")  # Name may not be in older tokens
        token_jti = payload.get("jti")

        # Check token blacklist (skip in test mode)
        if token_jti and not os.getenv("TEST_MODE"):
            if await is_token_blacklisted(db, token_jti):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "code": "TOKEN_REVOKED",
                        "message": "Token has been revoked",
                    },
                )

        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "jti": token_jti,
            "token": token,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Token validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid or expired token",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


async def is_token_blacklisted(db: AsyncSession, token_jti: str) -> bool:
    """
    Check if token is in blacklist.
    
    Args:
        db: Database session
        token_jti: JWT token ID to check
    
    Returns:
        True if token is blacklisted, False otherwise
    """
    from sqlalchemy import select
    
    result = await db.execute(
        select(AccessToken).where(AccessToken.token_jti == token_jti)
    )
    token = result.scalar_one_or_none()
    
    if token is None:
        return False
    
    # Check if token is expired (can be cleaned up)
    if token.is_expired():
        # Token expired, not in blacklist anymore
        return False
    
    return True


def get_token_from_request(request: Request) -> Optional[str]:
    """
    Extract token from request headers.
    
    Usage:
        token = get_token_from_request(request)
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    return auth_header[7:]  # Remove "Bearer " prefix
