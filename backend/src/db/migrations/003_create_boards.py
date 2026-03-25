"""
Migration: Create boards table.

This migration creates the boards table for task management.
Run after 002_create_access_tokens migration from auth API.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create boards table.
    
    Main table for task boards with owner reference to users table.
    """
    await connection.execute(text("""
        CREATE TYPE board_status AS ENUM ('active', 'archived')
    """))
    
    await connection.execute(text("""
        CREATE TABLE boards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description VARCHAR(10000),
            owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status board_status DEFAULT 'active' NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_boards_owner_id ON boards(owner_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_boards_status ON boards(status)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_boards_created_at ON boards(created_at)
    """))


async def downgrade(connection):
    """
    Drop boards table and enum type.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS boards CASCADE
    """))
    
    await connection.execute(text("""
        DROP TYPE IF EXISTS board_status
    """))
