
"""Rename description to name

Revision ID: 1_rename_description_to_name
Revises:
Create Date: 2025-12-28 14:08:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1_rename_description_to_name'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('photos', 'description', new_column_name='name')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('photos', 'name', new_column_name='description')
