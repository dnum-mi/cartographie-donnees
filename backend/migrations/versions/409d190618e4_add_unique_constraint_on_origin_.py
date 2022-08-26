"""Add unique constraint on origin application table

Revision ID: 409d190618e4
Revises: 569168f6d86d
Create Date: 2022-08-26 10:30:24.040245

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '409d190618e4'
down_revision = '569168f6d86d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint('unique_origin_application', 'origin_application', ['data_source_id', 'application_id'])


def downgrade():
    op.drop_constraint('unique_origin_application', 'origin_application', type_='unique')
