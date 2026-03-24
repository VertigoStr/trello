"""
Authentication routes for registration, login, and logout.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple

from src.db.connection import get_db
from src.services.auth_service import AuthService
from src.api.schemas.register import RegisterRequest, RegisterResponse
from src.api.schemas.login import LoginRequest, LoginResponse
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
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """
    Login user.
    
    - **email**: User's email address
    - **password**: User's password
    
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
        user, access_token = await auth_service.login(
            email=request.email,
            password=request.password,
        )
        
        return LoginResponse(
            user_id=user.id,
            email=user.email,
            name=user.name,
            access_token=access_token,
            token_type="Bearer",
            expires_in=604800,  # 7 days in seconds
        )
    
    except ValueError as e:
        error_msg = str(e)
        
        if "locked" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail={
                    "code": "ACCOUNT_LOCKED",
                    "message": "Account is locked due to too many failed login attempts",
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
    db: AsyncSession = Depends(get_db),
    # TODO: Add JWT dependency injection in US3
) -> dict:
    """
    Logout user.
    
    Requires valid JWT token in Authorization header.
    
    Returns:
    - **message**: Success message
    """
    # TODO: Implement token extraction and validation in US3
    auth_service = AuthService(db)
    
    # Placeholder - will be implemented in US3
    # await auth_service.logout(user_id)
    
    return {"message": "Successfully logged out"}
