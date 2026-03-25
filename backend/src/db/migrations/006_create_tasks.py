"""
Migration: Create tasks table.

This migration creates the tasks table for individual work items.
Includes soft delete support for task recovery.
"""
from sqlalchemy import text


async def upgrade(connection):
    """
    Create tasks table.
    
    Tasks are individual work items within columns.
    Supports soft delete for recovery.
    """
    await connection.execute(text("""
        CREATE TABLE tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            position INTEGER NOT NULL,
            assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
            is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    """))
    
    # Create indexes
    await connection.execute(text("""
        CREATE INDEX idx_tasks_column_id ON tasks(column_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_tasks_position ON tasks(position)
    """))
    
    await connection.execute(text("""
        CREATE INDEX idx_tasks_is_deleted ON tasks(is_deleted)
    """))


async def downgrade(connection):
    """
    Drop tasks table.
    """
    await connection.execute(text("""
        DROP TABLE IF EXISTS tasks CASCADE
    """))
