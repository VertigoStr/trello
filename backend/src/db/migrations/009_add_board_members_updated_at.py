"""
Migration: Add updated_at column to board_members table.

This migration adds the missing updated_at column to board_members.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Add updated_at column to board_members table.
    """
    # Check if column already exists
    result = await connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'board_members' 
        AND column_name = 'updated_at'
    """))
    
    if result.fetchone():
        # Column already exists, skip
        return
    
    # Add updated_at column
    await connection.execute(text("""
        ALTER TABLE board_members 
        ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    """))
    
    # Update existing rows
    await connection.execute(text("""
        UPDATE board_members 
        SET updated_at = created_at 
        WHERE updated_at IS NULL
    """))
    
    # Create index
    await connection.execute(text("""
        CREATE INDEX idx_board_members_updated_at ON board_members(updated_at)
    """))


async def downgrade(connection):
    """
    Drop updated_at column from board_members table.
    """
    await connection.execute(text("""
        ALTER TABLE board_members 
        DROP COLUMN IF EXISTS updated_at CASCADE
    """))
