"""transform origin_applications relationship

Revision ID: 569168f6d86d
Revises: 6d5c56a846c9
Create Date: 2022-08-24 11:54:31.711218

"""
from alembic import op
import sqlalchemy as sa

revision = '569168f6d86d'
down_revision = '6d5c56a846c9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('origin_application',
                    sa.Column('data_source_id', sa.Integer(), nullable=False),
                    sa.Column('application_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['application_id'], ['application.id'], ),
                    sa.ForeignKeyConstraint(['data_source_id'], ['data_source.id'], ),
                    sa.PrimaryKeyConstraint('data_source_id', 'application_id'),
                    sa.UniqueConstraint('data_source_id', 'application_id')
                    )

    op.drop_constraint('data_source_origin_application_id_fkey', 'data_source', type_='foreignkey')
    op.drop_column('data_source', 'origin_application_id')


def downgrade():
    op.add_column('data_source', sa.Column('origin_application_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('data_source_origin_application_id_fkey', 'data_source', 'application',
                          ['origin_application_id'], ['id'])

    op.drop_table('origin_application')
