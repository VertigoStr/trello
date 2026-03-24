"""
User model for authentication.
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from uuid import UUID
from src.db.base import BaseModel


class User(BaseModel):
    """
    User model for authentication system.
    
    Represents a user with email/password credentials.
    """
    
    __tablename__ = "users"
    
    # Email field (unique, required)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    
    # Password hash (required)
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    # User name (required)
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    # Account status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    # Failed login attempts
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    
    # Lockout timestamp
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        default=None,
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_is_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
    
    def is_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until
    
    def reset_failed_attempts(self) -> None:
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None
    
    def increment_failed_attempts(self, lockout_duration_minutes: int = 15) -> None:
        """Increment failed login attempts and lock if threshold reached."""
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= 5:
            from datetime import timedelta
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_duration_minutes)
