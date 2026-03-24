"""
Authentication routes for registration, login, and logout.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

from src.db.connection import get_db
from src.services.auth_service import AuthService
from src.api.schemas.register import RegisterRequest, RegisterResponse
from src.api.schemas.login import LoginRequest, LoginResponse
from src.middleware.rate_limiter import login_rate_limiter
from src.middleware.auth_middleware import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email and password.",
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    """
    Register a new user.
    
    - **email**: User's email address (must be unique)
    - **password**: Password (min 8 chars, letters + digits required)
    - **password_confirm**: Password confirmation (must match)
    - **name**: User's display name
    
    Returns:
    - **user_id**: User's unique identifier
    - **email**: User's email address
    - **name**: User's display name
    - **access_token**: JWT access token
    - **token_type**: Token type (Bearer)
    - **expires_in**: Token expiration time in seconds
    """
    auth_service = AuthService(db)
    
    try:
        user, access_token = await auth_service.register(
            email=request.email,
            password=request.password,
            name=request.name,
        )
        
        return RegisterResponse(
            user_id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="Bearer",
            expires_in=604800,  # 7 days in seconds
        )
    
    except ValueError as e:
        error_msg = str(e)
        
        if "already exists" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": "USER_EXISTS",
                    "message": "User with this email already exists",
                },
            )
        elif "password" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "VALIDATION_ERROR",
                    "message": error_msg,
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "VALIDATION_ERROR",
                    "message": error_msg,
                },
            )


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticate user with email and password.",
)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """
    Login user.
    
    - **email**: User's email address
    - **password**: User's password
    
    Rate limiting: 5 attempts per 15 minutes per email.
    
    Returns:
    - **user_id**: User's unique identifier
    - **email**: User's email address
    - **name**: User's display name
    - **access_token**: JWT access token
    - **token_type**: Token type (Bearer)
    - **expires_in**: Token expiration time in seconds
    """
    # Apply rate limiting
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = f"login:{login_data.email}"
    
    is_allowed, remaining = login_rate_limiter.is_allowed(rate_limit_key)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many login attempts. Please try again later.",
            },
            headers={
                "X-RateLimit-Limit": "5",
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": "900",  # 15 minutes
            },
        )
    
    auth_service = AuthService(db)
    
    try:
        user, access_token = await auth_service.login(
            email=login_data.email,
            password=login_data.password,
        )
        
        # Add rate limit headers to successful response
        response = LoginResponse(
            user_id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="Bearer",
            expires_in=604800,  # 7 days in seconds
        )
        
        return response
    
    except ValueError as e:
        error_msg = str(e)
        
        if "locked" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail={
                    "code": "ACCOUNT_LOCKED",
                    "message": "Account is locked due to too many failed login attempts",
                    "locked_until": getattr(auth_service, 'locked_until', None),
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "INVALID_CREDENTIALS",
                    "message": "Invalid email or password",
                },
            )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout user and invalidate access token.",
)
async def logout(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Logout user.
    
    Requires valid JWT token in Authorization header.
    Token is added to blacklist and cannot be reused.
    
    Returns:
    - **message**: Success message
    """
    auth_service = AuthService(db)
    
    # Revoke token (add to blacklist)
    await auth_service.logout(
        user_id=current_user["user_id"],
        token_jti=current_user.get("jti"),
    )
    
    logger.info(f"User logged out: {current_user['email']} (user_id={current_user['user_id']})")
    
    return {
        "status": "success",
        "message": "Successfully logged out",
    }
