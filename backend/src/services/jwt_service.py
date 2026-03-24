"""
JWT service for token generation and validation.
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
import os


class JWTService:
    """Service for JWT token operations."""
    
    def __init__(
        self,
        secret_key: Optional[str] = None,
        algorithm: str = "HS256",
        expiration_hours: int = 168,  # 7 days
    ):
        self.secret_key = secret_key or os.getenv("JWT_SECRET_KEY", "dev-secret-key")
        self.algorithm = algorithm
        self.expiration_hours = expiration_hours
    
    def create_access_token(
        self,
        user_id: UUID,
        email: str,
        additional_claims: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Create a JWT access token.

        Args:
            user_id: User's unique identifier
            email: User's email address
            additional_claims: Optional additional JWT claims

        Returns:
            Encoded JWT token string
        """
        now = datetime.utcnow()
        expire = now + timedelta(hours=self.expiration_hours)
        
        # Generate unique token ID (JTI) for blacklist tracking
        token_jti = str(uuid4())

        payload = {
            "sub": str(user_id),  # Subject (user ID)
            "email": email,
            "jti": token_jti,  # JWT ID for blacklist tracking
            "iat": now,  # Issued at
            "exp": expire,  # Expiration time
            "type": "access",
        }

        if additional_claims:
            payload.update(additional_claims)

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """
        Decode and validate a JWT token.
        
        Args:
            token: JWT token string
        
        Returns:
            Decoded token payload
        
        Raises:
            jwt.ExpiredSignatureError: Token has expired
            jwt.InvalidTokenError: Token is invalid
        """
        return jwt.decode(
            token,
            self.secret_key,
            algorithms=[self.algorithm],
        )
    
    def get_token_expiry(self, token: str) -> datetime:
        """
        Get token expiration time.
        
        Args:
            token: JWT token string
        
        Returns:
            Expiration datetime
        """
        payload = self.decode_token(token)
        return datetime.fromtimestamp(payload["exp"])
    
    def is_token_expired(self, token: str) -> bool:
        """
        Check if token is expired.
        
        Args:
            token: JWT token string
        
        Returns:
            True if expired, False otherwise
        """
        try:
            self.decode_token(token)
            return False
        except jwt.ExpiredSignatureError:
            return True


# Global instance
jwt_service = JWTService()
