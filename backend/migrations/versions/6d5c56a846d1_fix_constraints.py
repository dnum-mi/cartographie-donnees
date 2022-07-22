"""Fix constraints

Revision ID: 6d5c56a846d1
Revises: 5005c15e8770
Create Date: 2022-07-12 13:40:47.337875

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6d5c56a846d1'
down_revision = '5005c15e8770'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint('unique_association_exposition', 'association_exposition', ['data_source_id', 'exposition_id'])
    op.create_unique_constraint('unique_association_family', 'association_family', ['data_source_id', 'family_id'])
    op.create_unique_constraint('unique_association_reutilization', 'association_reutilization', ['data_source_id', 'application_id'])
    op.create_unique_constraint('unique_association_tag', 'association_tag', ['data_source_id', 'tag_id'])
    op.drop_constraint('open_data_value_key', 'open_data', type_='unique')
    op.create_unique_constraint('unique_open_data', 'open_data', ['value', 'parent_id'])
    op.create_unique_constraint('unique_ownerships', 'ownerships', ['user_id', 'application_id'])


def downgrade():
    op.drop_constraint('unique_ownerships', 'ownerships', type_='unique')
    op.drop_constraint('unique_open_data', 'open_data', type_='unique')
    op.create_unique_constraint('open_data_value_key', 'open_data', ['value'])
    op.drop_constraint('unique_association_tag', 'association_tag', type_='unique')
    op.drop_constraint('unique_association_reutilization', 'association_reutilization', type_='unique')
    op.drop_constraint('unique_association_family', 'association_family', type_='unique')
    op.drop_constraint('unique_association_exposition', 'association_exposition', type_='unique')
