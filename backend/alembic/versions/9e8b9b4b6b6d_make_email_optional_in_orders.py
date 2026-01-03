"""make_email_optional_in_orders

Revision ID: 9e8b9b4b6b6d
Revises: bbdf3c59d3fb
Create Date: 2024-07-25 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e8b9b4b6b6d'
down_revision: Union[str, None] = 'bbdf3c59d3fb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('orders', 'email',
               existing_type=sa.VARCHAR(),
               nullable=True)


def downgrade() -> None:
    op.alter_column('orders', 'email',
               existing_type=sa.VARCHAR(),
               nullable=False)
