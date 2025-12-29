
"""Rename description to name

Revision ID: 0fe4fc3f4cbb
Revises: 426efb5376e7
Create Date: 2025-12-29 13:26:57.436623

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0fe4fc3f4cbb'
down_revision: Union[str, Sequence[str], None] = '426efb5376e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('photos', 'description', new_column_name='name')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('photos', 'name', new_column_name='description')
