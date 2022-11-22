"""Rename classification to analysis_axis

Revision ID: 6053b0316777
Revises: 5f95f134356d
Create Date: 2022-11-21 15:09:28.824388

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6053b0316777'
down_revision = '5f95f134356d'
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table('association_classification', 'association_analysis_axis')


def downgrade():
    op.rename_table('association_analysis_axis', 'association_classification')
