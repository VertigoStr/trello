"""
AccessToken model for token blacklist.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from uuid import UUID, uuid4
from src.db.base import BaseModel


class AccessToken(BaseModel):
    """
    AccessToken model for token blacklist (revocation list).
    
    Stores revoked tokens to prevent their reuse after logout.
    Tokens are automatically cleaned up after expiration.
    """
    
    __tablename__ = "access_tokens"
    
    # Token JTI (JWT ID) - unique identifier for each token
    token_jti: Mapped[UUID] = mapped_column(
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    
    # User ID who owns this token
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # When token was revoked
    revoked_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False,
    )
    
    # When token expires (for cleanup)
    expires_at: Mapped[datetime] = mapped_column(
        nullable=False,
        index=True,
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_token_jti", "token_jti", unique=True),
        Index("idx_token_user_id", "user_id"),
        Index("idx_token_expires_at", "expires_at"),
    )
    
    # Relationship to User
    # user = relationship("User", back_populates="access_tokens")
    
    def __repr__(self) -> str:
        return f"<AccessToken(jti={self.token_jti}, user_id={self.user_id})>"
    
    def is_expired(self) -> bool:
        """Check if token is expired."""
        return datetime.utcnow() > self.expires_at
