
"""Add item_description column

Revision ID: 6_add_item_description
Revises: 5_rename_description_to_name
Create Date: 2025-12-28 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6_add_item_description'
down_revision: Union[str, Sequence[str], None] = '5_rename_description_to_name'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('photos', sa.Column('item_description', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('photos', 'item_description')
