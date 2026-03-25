"""
Migration: Add index for tasks.version column.

Feature: 004-create-tasks-boards
"""

from alembic import op


# Revision identifiers
revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create index on tasks.version column."""
    # Index already created in migration 007, but we ensure it exists
    # This migration is a no-op since the index was created in 007
    pass


def downgrade() -> None:
    """Drop index on tasks.version column."""
    # Index will be dropped when version column is removed in 007 downgrade
    pass
