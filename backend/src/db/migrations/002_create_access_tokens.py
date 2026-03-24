"""
Migration: Create access_tokens table.

This migration creates the access_tokens table for token blacklist.
Run this migration after 001_create_users.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create access_tokens table.
    
    This table stores revoked tokens to prevent reuse after logout.
    """
    await connection.execute(text("""
        CREATE TABLE access_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token_jti UUID UNIQUE NOT NULL,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            revoked_at TIMESTAMP DEFAULT NOW() NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_token_jti ON access_tokens(token_jti)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_token_user_id ON access_tokens(user_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_token_expires_at ON access_tokens(expires_at)
    """))


async def downgrade(connection):
    """
    Drop access_tokens table.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS access_tokens CASCADE
    """))
