"""Remove deprecated attributes

Revision ID: 5005c15e8770
Revises: 1b6f47c6e77a
Create Date: 2022-07-07 12:42:42.398488

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5005c15e8770'
down_revision = '1b6f47c6e77a'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('application', 'potential_experimentation')
    op.drop_column('data_source', 'transformation')
    op.drop_column('data_source', 'ministry_interior')
    op.drop_column('data_source', 'geo_localizable')


def downgrade():
    op.add_column('data_source', sa.Column('geo_localizable', sa.BOOLEAN(), nullable=True))
    op.add_column('data_source', sa.Column('ministry_interior', sa.BOOLEAN(), nullable=True))
    op.add_column('data_source', sa.Column('transformation', sa.BOOLEAN(), nullable=True))
    op.add_column('application', sa.Column('potential_experimentation', sa.TEXT(), nullable=True))
