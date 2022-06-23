"""Add label on enumerations

Revision ID: e7b6e48723e8
Revises: 1b6f47c6e77a
Create Date: 2022-06-21 19:56:58.258818

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e7b6e48723e8'
down_revision = '1b6f47c6e77a'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('exposition', sa.Column('label', sa.String(), nullable=True))
    op.add_column('family', sa.Column('label', sa.String(), nullable=True))
    op.add_column('open_data', sa.Column('label', sa.String(), nullable=True))
    op.add_column('organization', sa.Column('label', sa.String(), nullable=True))
    op.add_column('origin', sa.Column('label', sa.String(), nullable=True))
    op.add_column('sensibility', sa.Column('label', sa.String(), nullable=True))
    op.add_column('tag', sa.Column('label', sa.String(), nullable=True))
    op.add_column('type', sa.Column('label', sa.String(), nullable=True))
    op.add_column('update_frequency', sa.Column('label', sa.String(), nullable=True))


def downgrade():
    op.drop_column('update_frequency', 'label')
    op.drop_column('type', 'label')
    op.drop_column('tag', 'label')
    op.drop_column('sensibility', 'label')
    op.drop_column('origin', 'label')
    op.drop_column('organization', 'label')
    op.drop_column('open_data', 'label')
    op.drop_column('family', 'label')
    op.drop_column('exposition', 'label')
