"""Init_database

Revision ID: 1b6f47c6e77a
Revises:
Create Date: 2021-06-14 10:58:27.462160

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1b6f47c6e77a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('exposition',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'exposition.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('family',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'family.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('open_data',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'open_data.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('organization',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'organization.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('origin',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'origin.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('sensibility',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'sensibility.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('tag',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'tag.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('type',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'type.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('update_frequency',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('value', sa.String(), nullable=False),
                    sa.Column('parent_id', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.ForeignKeyConstraint(['parent_id'], [
                        'update_frequency.id'], ),
                    sa.UniqueConstraint('value', 'parent_id')
                    )
    op.create_table('user',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('first_name', sa.String(), nullable=False),
                    sa.Column('last_name', sa.String(), nullable=False),
                    sa.Column('email', sa.String(), nullable=False),
                    sa.Column('password_hash', sa.String(
                        length=128), nullable=False),
                    sa.Column('is_admin', sa.Boolean(), nullable=False),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('email')
                    )
    op.create_table('application',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.String(), nullable=False),
                    sa.Column('organization_id', sa.Integer(), nullable=True),
                    sa.Column('goals', sa.Text(), nullable=False),
                    sa.Column('potential_experimentation',
                              sa.Text(), nullable=True),
                    sa.Column('access_url', sa.Text(), nullable=True),
                    sa.Column('operator_count', sa.Integer(), nullable=True),
                    sa.Column('operator_count_comment',
                              sa.String(), nullable=True),
                    sa.Column('user_count', sa.Integer(), nullable=True),
                    sa.Column('user_count_comment',
                              sa.String(), nullable=True),
                    sa.Column('monthly_connection_count',
                              sa.Integer(), nullable=True),
                    sa.Column('monthly_connection_count_comment',
                              sa.String(), nullable=True),
                    sa.Column('context_email', sa.Text(), nullable=True),
                    sa.Column('validation_date', sa.DateTime(), nullable=True),
                    sa.Column('historic', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['organization_id'], [
                                            'organization.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_table('data_source',
                    sa.Column('id', sa.Integer(),
                              autoincrement=True, nullable=False),
                    sa.Column('name', sa.String(),
                              server_default='', nullable=False),
                    sa.Column('description', sa.Text(), nullable=True),
                    sa.Column('type_id', sa.Integer(), nullable=True),
                    sa.Column('ministry_interior',
                              sa.Boolean(), nullable=True),
                    sa.Column('geo_localizable', sa.Boolean(), nullable=True),
                    sa.Column('transformation', sa.Boolean(), nullable=True),
                    sa.Column('example', sa.Text(), nullable=True),
                    sa.Column('referentiel_id', sa.Integer(), nullable=True),
                    sa.Column('sensibility_id', sa.Integer(), nullable=True),
                    sa.Column('open_data_id', sa.Integer(), nullable=True),
                    sa.Column('database_name', sa.String(), nullable=True),
                    sa.Column('database_table_name',
                              sa.String(), nullable=True),
                    sa.Column('database_table_count',
                              sa.Integer(), nullable=True),
                    sa.Column('fields', sa.Text(), nullable=True),
                    sa.Column('field_count', sa.Integer(), nullable=True),
                    sa.Column('volumetry', sa.Integer(), nullable=True),
                    sa.Column('volumetry_comment', sa.String(), nullable=True),
                    sa.Column('monthly_volumetry',
                              sa.Integer(), nullable=True),
                    sa.Column('monthly_volumetry_comment',
                              sa.String(), nullable=True),
                    sa.Column('update_frequency_id',
                              sa.Integer(), nullable=True),
                    sa.Column('conservation', sa.String(), nullable=True),
                    sa.Column('origin_id', sa.Integer(), nullable=True),
                    sa.Column('origin_application_id',
                              sa.Integer(), nullable=True),
                    sa.Column('application_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['application_id'], [
                                            'application.id'], ),
                    sa.ForeignKeyConstraint(
                        ['open_data_id'], ['open_data.id'], ),
                    sa.ForeignKeyConstraint(['origin_application_id'], [
                        'application.id'], ),
                    sa.ForeignKeyConstraint(['origin_id'], ['origin.id'], ),
                    sa.ForeignKeyConstraint(
                        ['referentiel_id'], ['family.id'], ),
                    sa.ForeignKeyConstraint(['sensibility_id'], [
                                            'sensibility.id'], ),
                    sa.ForeignKeyConstraint(['type_id'], ['type.id'], ),
                    sa.ForeignKeyConstraint(['update_frequency_id'], [
                        'update_frequency.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_table('ownerships',
                    sa.Column('user_id', sa.Integer(), nullable=False),
                    sa.Column('application_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['application_id'], [
                                            'application.id'], ),
                    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
                    sa.PrimaryKeyConstraint('user_id', 'application_id'),
                    sa.UniqueConstraint('user_id', 'application_id')
                    )
    op.create_table('association_classification',
                    sa.Column('data_source_id', sa.Integer(), nullable=True),
                    sa.Column('family_id', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['data_source_id'], [
                                            'data_source.id'], ),
                    sa.ForeignKeyConstraint(['family_id'], ['family.id'], ),
                    sa.UniqueConstraint('data_source_id', 'family_id')
                    )
    op.create_table('association_exposition',
                    sa.Column('data_source_id', sa.Integer(), nullable=False),
                    sa.Column('exposition_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['data_source_id'], [
                                            'data_source.id'], ),
                    sa.ForeignKeyConstraint(
                        ['exposition_id'], ['exposition.id'], ),
                    sa.PrimaryKeyConstraint('data_source_id', 'exposition_id'),
                    sa.UniqueConstraint('data_source_id', 'exposition_id')
                    )
    op.create_table('association_family',
                    sa.Column('data_source_id', sa.Integer(), nullable=False),
                    sa.Column('family_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['data_source_id'], [
                                            'data_source.id'], ),
                    sa.ForeignKeyConstraint(['family_id'], ['family.id'], ),
                    sa.PrimaryKeyConstraint('data_source_id', 'family_id'),
                    sa.UniqueConstraint('data_source_id', 'family_id')
                    )
    op.create_table('association_reutilization',
                    sa.Column('data_source_id', sa.Integer(), nullable=False),
                    sa.Column('application_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['application_id'], [
                                            'application.id'], ),
                    sa.ForeignKeyConstraint(['data_source_id'], [
                                            'data_source.id'], ),
                    sa.PrimaryKeyConstraint(
                        'data_source_id', 'application_id'),
                    sa.UniqueConstraint('data_source_id', 'application_id')
                    )
    op.create_table('association_tag',
                    sa.Column('data_source_id', sa.Integer(), nullable=False),
                    sa.Column('tag_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['data_source_id'], [
                                            'data_source.id'], ),
                    sa.ForeignKeyConstraint(['tag_id'], ['tag.id'], ),
                    sa.PrimaryKeyConstraint('data_source_id', 'tag_id'),
                    sa.UniqueConstraint('data_source_id', 'tag_id')
                    )
    # ### end Alembic commands ###

    op.execute("INSERT INTO \"user\" (first_name,last_name,email,password_hash,is_admin)"
               "VALUES('Admin','Admin','admin@default.com',"
               "'pbkdf2:sha256:260000$anVLUz9U5j7AQo1B$da48b7c5e97ffed02339e9c5645fc78c81c8b44f53744a10bb93e14d920e4f95',True)"
               )


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('association_tag')
    op.drop_table('association_reutilization')
    op.drop_table('association_family')
    op.drop_table('association_exposition')
    op.drop_table('association_classification')
    op.drop_table('ownerships')
    op.drop_table('data_source')
    op.drop_table('application')
    op.drop_table('user')
    op.drop_table('update_frequency')
    op.drop_table('type')
    op.drop_table('tag')
    op.drop_table('sensibility')
    op.drop_table('origin')
    op.drop_table('organization')
    op.drop_table('open_data')
    op.drop_table('family')
    op.drop_table('exposition')
    # ### end Alembic commands ###
