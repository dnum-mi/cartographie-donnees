"""Remove referentiel_id attribute

Revision ID: dfee9776774b
Revises: 409d190618e4
Create Date: 2022-08-30 16:33:22.806151

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dfee9776774b'
down_revision = '409d190618e4'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint('data_source_referentiel_id_fkey', 'data_source', type_='foreignkey')
    op.drop_column('data_source', 'referentiel_id')


def downgrade():
    op.add_column('data_source', sa.Column('referentiel_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('data_source_referentiel_id_fkey', 'data_source', 'family', ['referentiel_id'], ['id'])
