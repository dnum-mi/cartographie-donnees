"""Fix constraints

Revision ID: 6d5c56a846d1
Revises: 5005c15e8770
Create Date: 2022-07-12 13:40:47.337875

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6d5c56a846d0'
down_revision = '6d5c56a846d1'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('data_source', sa.Column('is_reference', sa.BOOLEAN(), nullable=True))



def downgrade():
    op.drop_column('data_source', 'is_reference')
