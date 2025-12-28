
"""Rename description to name

Revision ID: 5_rename_description_to_name
Revises: 4_initial_migration
Create Date: 2025-12-28 14:18:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5_rename_description_to_name'
down_revision: Union[str, Sequence[str], None] = '4_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('photos', 'description', new_column_name='name')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('photos', 'name', new_column_name='description')
