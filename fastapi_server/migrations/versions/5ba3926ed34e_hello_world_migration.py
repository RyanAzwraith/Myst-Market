"""hello world migration

Revision ID: 5ba3926ed34e
Revises: 
Create Date: 2026-06-08 12:01:14.051103

"""
from typing import Sequence, Union



# revision identifiers, used by Alembic.
revision: str = '5ba3926ed34e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    print("hello migration world")
    """Upgrade schema."""
    pass


def downgrade() -> None:
    print("hello rollback")

    """Downgrade schema."""
    pass
