"""
Authentication service for registration, login, and logout.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Tuple, Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging

from src.models.user import User
from src.models.token import AccessToken
from src.services.password_service import hash_password, verify_password, validate_password
from src.services.jwt_service import jwt_service

logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def register(
        self,
        email: str,
        password: str,
        name: str,
    ) -> Tuple[User, str]:
        """
        Register a new user.
        
        Args:
            email: User's email
            password: Plain text password
            name: User's name
        
        Returns:
            Tuple of (User object, access token)
        
        Raises:
            ValueError: If email already exists or password is invalid
        """
        # Validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            raise ValueError(message)
        
        # Check if email already exists
        existing_user = await self._get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create new user
        password_hash = hash_password(password)
        user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            is_active=True,
            failed_login_attempts=0,
            locked_until=None,
        )
        
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        
        logger.info(f"User registered: {user.email} (id={user.id})")
        
        # Generate access token
        access_token = jwt_service.create_access_token(
            user_id=user.id,
            email=user.email,
        )
        
        return user, access_token
    
    async def login(
        self,
        email: str,
        password: str,
    ) -> Tuple[User, str]:
        """
        Authenticate user and return access token.
        
        Args:
            email: User's email
            password: Plain text password
        
        Returns:
            Tuple of (User object, access token)
        
        Raises:
            ValueError: If credentials are invalid or account is locked
        """
        # Get user by email
        user = await self._get_user_by_email(email)
        
        if not user:
            logger.warning(f"Login attempt for non-existent user: {email}")
            raise ValueError("Invalid email or password")
        
        # Check if account is locked
        if user.is_locked():
            logger.warning(f"Login attempt for locked account: {email}")
            raise ValueError(f"Account is locked until {user.locked_until}")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for: {email}")
            user.increment_failed_attempts()
            await self.db.flush()
            
            if user.is_locked():
                logger.warning(f"Account locked after failed attempts: {email}")
            
            raise ValueError("Invalid email or password")
        
        # Reset failed attempts on successful login
        user.reset_failed_attempts()
        await self.db.flush()
        
        logger.info(f"User logged in: {user.email} (id={user.id})")
        
        # Generate access token
        access_token = jwt_service.create_access_token(
            user_id=user.id,
            email=user.email,
        )
        
        return user, access_token
    
    async def logout(self, user_id: UUID, token_jti: Optional[str] = None) -> None:
        """
        Logout user and revoke token (add to blacklist).

        Args:
            user_id: User's unique identifier
            token_jti: JWT token ID to revoke

        Note:
        Token is added to blacklist to prevent reuse.
        Blacklisted tokens are automatically cleaned up after expiration.
        """
        if token_jti:
            # Add token to blacklist
            token = AccessToken(
                token_jti=token_jti,
                user_id=user_id,
                revoked_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(hours=168),  # 7 days
            )
            self.db.add(token)
            await self.db.flush()
            
            logger.info(f"Token revoked for user {user_id}: {token_jti}")
        else:
            logger.info(f"User logged out (no token JTI provided): {user_id}")
    
    async def _get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
