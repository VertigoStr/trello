"""
Migration: Create board_members table.

This migration creates the board_members table for managing
board participants with flexible permissions.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create board_members table.
    
    Junction table between users and boards with role-based permissions.
    """
    await connection.execute(text("""
        CREATE TABLE board_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL DEFAULT 'member',
            permissions JSONB DEFAULT '["read"]' NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
            UNIQUE (board_id, user_id)
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_board_members_board_id ON board_members(board_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_board_members_user_id ON board_members(user_id)
    """))


async def downgrade(connection):
    """
    Drop board_members table.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS board_members CASCADE
    """))
