"""updated bool, default

Revision ID: becbc996126f
Revises: 1f466ccd74e7
Create Date: 2026-06-26 11:45:44.615330

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'becbc996126f'
down_revision: Union[str, Sequence[str], None] = '1f466ccd74e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
