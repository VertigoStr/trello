"""
Migration: Add version column to tasks table for optimistic locking.

Feature: 004-create-tasks-boards
"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers
revision = "007"
down_revision = "006"  # After tasks table creation
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add version column to tasks table."""
    # Add version column with default value 1
    op.add_column(
        "tasks",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1")
    )
    
    # Create index for version column
    op.create_index("idx_tasks_version", "tasks", ["version"])
    
    # Change position column from Integer to Float
    # Note: This is safe because all existing positions are integers
    # and will be preserved as float values (e.g., 1 -> 1.0)
    op.alter_column(
        "tasks",
        "position",
        existing_type=sa.Integer(),
        type_=sa.Float(),
        existing_nullable=False
    )


def downgrade() -> None:
    """Revert version column addition."""
    # Drop index
    op.drop_index("idx_tasks_version", table_name="tasks")
    
    # Remove version column
    op.drop_column("tasks", "version")
    
    # Revert position column back to Integer
    op.alter_column(
        "tasks",
        "position",
        existing_type=sa.Float(),
        type_=sa.Integer(),
        existing_nullable=False
    )
