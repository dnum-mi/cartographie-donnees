"""Add data source highlights index

Revision ID: b823920f67b6
Revises: 5f95f134356d
Create Date: 2022-11-21 07:36:56.399087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b823920f67b6'
down_revision = '5f95f134356d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('data_source', sa.Column('highlights_index', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('data_source', 'highlights_index')
