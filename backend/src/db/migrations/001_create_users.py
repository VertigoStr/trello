"""
Migration: Create users table.

This migration creates the users table for authentication.
Run this migration on initial database setup.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create users table.
    
    This is the main table for user authentication.
    """
    await connection.execute(text("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE NOT NULL,
            failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
            locked_until TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_users_email ON users(email)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_users_is_active ON users(is_active)
    """))


async def downgrade(connection):
    """
    Drop users table.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS users CASCADE
    """))
