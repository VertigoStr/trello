"""
Migration: Create columns table.

This migration creates the columns table for organizing tasks on boards.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create columns table.
    
    Columns are used to organize tasks within a board.
    """
    await connection.execute(text("""
        CREATE TABLE columns (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            position INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_columns_board_id ON columns(board_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_columns_position ON columns(position)
    """))


async def downgrade(connection):
    """
    Drop columns table.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS columns CASCADE
    """))
