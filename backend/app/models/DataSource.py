from sqlalchemy.inspection import inspect
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app import db
from app.models import SearchableMixin, BaseModel, Type, Application, OpenData, Family, UpdateFrequency, Origin, Exposition, Sensibility, Tag
from app.constants import DATASOURCE_ID_NO_COMMENT


association_analysis_axis_table = db.Table(
    'association_analysis_axis', db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey('data_source.id'), primary_key=True),
    db.Column('family_id', db.Integer, db.ForeignKey('family.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'family_id')
)

association_family_table = db.Table(
    'association_family',
    db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey(
        'data_source.id'), primary_key=True),
    db.Column('family_id', db.Integer, db.ForeignKey(
        'family.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'family_id')
)

association_exposition_table = db.Table(
    'association_exposition',
    db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey(
        'data_source.id'), primary_key=True),
    db.Column('exposition_id', db.Integer, db.ForeignKey(
        'exposition.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'exposition_id')
)

association_reutilization_table = db.Table(
    'association_reutilization',
    db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey(
        'data_source.id'), primary_key=True),
    db.Column('application_id', db.Integer, db.ForeignKey(
        'application.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'application_id')
)

association_tag_table = db.Table(
    'association_tag',
    db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey(
        'data_source.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'tag_id')
)

origin_application_table = db.Table(
    'origin_application',
    db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey(
        'data_source.id'), primary_key=True),
    db.Column('application_id', db.Integer, db.ForeignKey('application.id'), primary_key=True),
    db.UniqueConstraint('data_source_id', 'application_id')
)


class DataSource(SearchableMixin, BaseModel):
    """The model for storing the data sources in database"""

    """List of the fields indexed by Elasticsearch"""
    __search_index_fields__ = [
        'name', 'description', 'family_name', "analysis_axis_name", 'type_name', 'referentiel_name',
        'sensibility_name', 'open_data_name', 'exposition_name', 'origin_name', 'application_name',
        'application_long_name', 'organization_name', 'organization_long_name', 'application_goals',
        'tag_name'
    ]

    """List of the fields used by Elasticsearch in the text queries (inclusions and exclusions)"""
    __text_search_fields__ = [
        'name', 'description', 'family_name', "analysis_axis_name", 'type_name', 'application_name',
        'application_long_name', 'organization_name', 'organization_long_name', 'application_goals',
        'tag_name'
    ]

    """List of the fields to count the number of results on"""
    __search_count__ = [
        'family_name', "analysis_axis_name", 'type_name', 'referentiel_name', 'sensibility_name', 'open_data_name',
        'exposition_name', 'origin_name', 'application_name', 'application_long_name', 'organization_name', 'tag_name'
    ]

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, server_default="", nullable=False)
    description = db.Column(db.Text)
    type_id = db.Column(db.Integer, db.ForeignKey('type.id'))
    example = db.Column(db.Text)
    is_reference = db.Column(db.Boolean)
    sensibility_id = db.Column(db.Integer, db.ForeignKey('sensibility.id'))
    open_data_id = db.Column(db.Integer, db.ForeignKey('open_data.id'))
    database_name = db.Column(db.String)
    database_table_name = db.Column(db.String)
    database_table_count = db.Column(db.Integer)
    fields = db.Column(db.Text)
    field_count = db.Column(db.Integer)
    volumetry = db.Column(db.Integer)
    volumetry_comment = db.Column(db.String)
    monthly_volumetry = db.Column(db.Integer)
    monthly_volumetry_comment = db.Column(db.String)
    update_frequency_id = db.Column(
        db.Integer, db.ForeignKey('update_frequency.id'))
    conservation = db.Column(db.String)
    families = db.relationship(
        "Family",
        secondary=association_family_table,
        lazy="joined",
        backref="data_sources",
    )
    analysis_axis = db.relationship(
        "Family",
        lazy="joined",
        secondary=association_analysis_axis_table,
    )
    origin_id = db.Column(db.Integer, db.ForeignKey('origin.id'))
    expositions = db.relationship(
        "Exposition",
        lazy="joined",
        secondary=association_exposition_table,
    )
    reutilizations = db.relationship(
        "Application",
        lazy="joined",
        secondary=association_reutilization_table,
        backref="data_source_reutilizations",
    )
    tags = db.relationship(
        "Tag",
        lazy="joined",
        secondary=association_tag_table,
        backref="data_sources",
    )
    origin_applications = db.relationship(
        "Application",
        lazy="joined",
        secondary=origin_application_table,
        backref="origin_data_sources",
    )

    application_id = db.Column(
        db.Integer,
        db.ForeignKey('application.id'),
        nullable=False,
    )
    owners = association_proxy('application', 'owners')

    @property
    def referentiel_name(self):
        return self.family_name if self.is_reference else []

    @property
    def nb_reutilizations(self):
        return len(self.reutilizations)

    @property
    def nb_referentiels(self):
        return len(self.referentiel_name)

    @property
    def datasource_description_level(self):
        truthy_count = 0
        for key in DATASOURCE_ID_NO_COMMENT:
            if getattr(self, key) is not None and getattr(self, key) != []:
                truthy_count += 1
        return truthy_count/len(DATASOURCE_ID_NO_COMMENT)

    def get_enumeration_single(self, enumeration_id):
        return getattr(self, enumeration_id).full_path if getattr(self, enumeration_id) else None

    def get_enumeration_multiple(self, enumeration_id):
        return [enum.full_path for enum in getattr(self, enumeration_id)]

    def set_enumeration_single(self, value, enumeration_id, enumeration_class, error_label, mandatory=False):
        if not value:
            if mandatory:
                raise ValueError(f"{error_label} est un champ obligatoire.")
            else:
                setattr(self, enumeration_id, None)
        else:
            all_enum = enumeration_class.query.all()
            matches = [enum for enum in all_enum if enum.full_path == value]
            if len(matches) == 0:
                raise ValueError(f"{error_label} '{value}' n'existe pas.")
            setattr(self, enumeration_id, matches[0])

    def set_enumeration_multiple(self, value, enumeration_id, enumeration_class, error_label, mandatory=False):
        if not value:
            if mandatory:
                raise ValueError(f"{error_label} est un champ obligatoire.")
            else:
                setattr(self, enumeration_id, [])
        else:
            new_values = []
            all_enum = enumeration_class.query.all()
            for full_path in value.split(","):
                matches = [enum for enum in all_enum if enum.full_path == full_path]
                if len(matches) == 0:
                    raise ValueError(f"{error_label} '{full_path}' n'existe pas.")
                new_values.append(matches[0])
            setattr(self, enumeration_id, new_values)

    @property
    def type_name(self):
        return self.get_enumeration_single('type')

    @type_name.setter
    def type_name(self, type_name):
        self.set_enumeration_single(type_name, 'type', Type, 'Le type', mandatory=True)

    @property
    def family_name(self):
        return self.get_enumeration_multiple('families')

    @family_name.setter
    def family_name(self, family_name):
        self.set_enumeration_multiple(family_name, 'families', Family, 'La famille', mandatory=True)

    @property
    def analysis_axis_name(self):
        return self.get_enumeration_multiple('analysis_axis')

    @analysis_axis_name.setter
    def analysis_axis_name(self, analysis_axis_name):
        self.set_enumeration_multiple(analysis_axis_name, 'analysis_axis', Family, "L'axe d'analyse")

    @property
    def tag_name(self):
        return self.get_enumeration_multiple('tags')

    @tag_name.setter
    def tag_name(self, tag_name):
        self.set_enumeration_multiple(tag_name, 'tags', Tag, 'Le tag')

    @property
    def sensibility_name(self):
        return self.get_enumeration_single('sensibility')

    @sensibility_name.setter
    def sensibility_name(self, sensibility_name):
        self.set_enumeration_single(sensibility_name, 'sensibility', Sensibility, 'La sensibilité')

    @property
    def open_data_name(self):
        return self.get_enumeration_single('open_data')

    @open_data_name.setter
    def open_data_name(self, open_data_name):
        self.set_enumeration_single(open_data_name, 'open_data', OpenData, "La valeur d'Open data")

    @property
    def update_frequency_name(self):
        return self.get_enumeration_single('update_frequency')

    @update_frequency_name.setter
    def update_frequency_name(self, update_frequency_name):
        self.set_enumeration_single(update_frequency_name, 'update_frequency', UpdateFrequency,
                                    'La fréquence de mise à jour')

    @property
    def exposition_name(self):
        return self.get_enumeration_multiple('expositions')

    @exposition_name.setter
    def exposition_name(self, exposition_name):
        self.set_enumeration_multiple(exposition_name, 'expositions', Exposition, "L'exposition")

    @property
    def origin_name(self):
        return self.get_enumeration_single('origin')

    @origin_name.setter
    def origin_name(self, origin_name):
        self.set_enumeration_single(origin_name, 'origin', Origin, "L'origine")

    @property
    def reutilization_name(self):
        return [reutilization.name for reutilization in self.reutilizations] if self.reutilizations else []

    @reutilization_name.setter
    def reutilization_name(self, reutilization_name):
        if reutilization_name:
            new_reutilizations = []
            for reutilization in reutilization_name.split(","):
                new_reutilization = Application.query.filter_by(
                    name=reutilization).first()
                if not new_reutilization:
                    raise ValueError(
                        "L'application '{}' n'existe pas.".format(reutilization))
                new_reutilizations.append(new_reutilization)
            self.reutilizations = new_reutilizations
        else:
            self.reutilizations = []

    @property
    def application_name(self):
        return self.application.name

    @property
    def application_long_name(self):
        return self.application.long_name

    @application_name.setter
    def application_name(self, application_name):
        if not application_name:
            raise ValueError("L'application est un attribut obligatoire.")
        application = Application.query.filter_by(
            name=application_name).first()
        if not application:
            raise ValueError(
                "L'application '{}' n'existe pas.".format(application_name))
        self.application_id = application.id

    @property
    def origin_application_name(self):
        return [origin_application.name for origin_application in self.origin_applications] if self.origin_applications else []

    @origin_application_name.setter
    def origin_application_name(self, origin_application_name):
        if origin_application_name:
            new_origin_applications = []
            for origin_application in origin_application_name.split(","):
                new_origin_application = Application.query.filter_by(
                    name=origin_application).first()
                if not new_origin_application:
                    raise ValueError(
                        "L'application '{}' n'existe pas.".format(origin_application))
                new_origin_applications.append(new_origin_application)
            self.origin_applications = new_origin_applications
        else:
            self.origin_applications = []

    @property
    def organization_name(self):
        return self.application.organization_name

    @property
    def organization_long_name(self):
        return self.application.organization_long_name

    @property
    def application_goals(self):
        return self.application.goals

    @property
    def application_access_url(self):
        return self.application.access_url

    @property
    def application_administrator_count(self):
        return self.application.administrator_count

    @property
    def application_user_count(self):
        return self.application.user_count

    @property
    def application_monthly_connection_count(self):
        return self.application.monthly_connection_count

    @property
    def application_context_email(self):
        return self.application.context_email

    @property
    def application_operator_count(self):
        return self.application.operator_count

    @property
    def application_historic(self):
        return self.application.historic

    def to_dict(self, populate_statistics=False):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'application_name': self.application_name,
            'application_long_name': self.application_long_name,
            'family_name': self.family_name,
            'families': [family.to_dict() for family in self.families],
            'tag_name': self.tag_name,
            'tags': [tag.to_dict() for tag in self.tags],
            'reutilization_name': self.reutilization_name,
            'type_name': self.type_name,
            'example': self.example,
            'referentiel_name': self.referentiel_name,
            'sensibility_name': self.sensibility_name,
            'open_data_name': self.open_data_name,
            'database_name': self.database_name,
            'database_table_name': self.database_table_name,
            'database_table_count': self.database_table_count,
            'fields': self.fields,
            'field_count': self.field_count,
            'volumetry': self.volumetry,
            'volumetry_comment': self.volumetry_comment,
            'monthly_volumetry': self.monthly_volumetry,
            'monthly_volumetry_comment': self.monthly_volumetry_comment,
            'update_frequency': self.update_frequency.to_dict() if self.update_frequency else None,
            'update_frequency_name': self.update_frequency_name,
            'conservation': self.conservation,
            'analysis_axis_name': self.analysis_axis_name,
            'nb_referentiels': self.nb_referentiels,
            'exposition_name': self.exposition_name,
            'origin_name': self.origin_name,
            'application': self.application.to_dict(populate_statistics=populate_statistics),
            'organization_name': self.application.organization_name,
            'origin_applications': [application.to_dict() for application in self.origin_applications],
            'origin_application_name': self.origin_application_name,
            'reutilizations': [application.to_dict() for application in self.reutilizations],
            'nb_reutilizations': self.nb_reutilizations,
            'is_reference': self.is_reference,
            'datasource_description_level': self.datasource_description_level
        }

    def to_export(self):
        return {
            'name': self.name,
            'application_name': self.application_name,
            'description': self.description,
            'example': self.example,
            'family_name': ",".join(self.family_name),
            'analysis_axis_name': ",".join(self.analysis_axis_name),
            'type_name': self.type_name,
            'is_reference': self.is_reference,
            'origin_name': self.origin_name,
            'origin_application_name': ",".join(self.origin_application_name),
            'open_data_name': self.open_data_name,
            'exposition_name': ",".join(self.exposition_name),
            'sensibility_name': self.sensibility_name,
            'tag_name': ",".join(self.tag_name),

            'volumetry': self.volumetry,
            'volumetry_comment': self.volumetry_comment,
            'monthly_volumetry': self.monthly_volumetry,
            'monthly_volumetry_comment': self.monthly_volumetry_comment,
            'update_frequency_name': self.update_frequency_name,
            'conservation': self.conservation,
            'database_name': self.database_name,
            'database_table_count': self.database_table_count,
            'database_table_name': self.database_table_name,
            'field_count': self.field_count,
            'fields': self.fields,

            'reutilization_name': ",".join(self.reutilization_name),
        }

    def update_from_dict(self, data):
        self.name = data.get('name')
        self.description = data.get('description')
        self.application_id = data.get('application_id')
        self.families = data.get('families') if data.get('families') else []
        self.reutilizations = data.get(
            'reutilizations') if data.get('reutilizations') else []
        self.tags = data.get('tags') if data.get('tags') else []
        self.type_id = data.get('type_id')
        self.example = data.get('example')
        self.sensibility_id = data.get('sensibility_id')
        self.open_data_id = data.get('open_data_id')
        self.database_name = data.get('database_name')
        self.database_table_name = data.get('database_table_name')
        self.database_table_count = data.get('database_table_count')
        self.fields = data.get('fields')
        self.field_count = data.get('field_count')
        self.volumetry = data.get('volumetry')
        self.volumetry_comment = data.get('volumetry_comment')
        self.monthly_volumetry = data.get('monthly_volumetry')
        self.monthly_volumetry_comment = data.get('monthly_volumetry_comment')
        self.update_frequency_id = data.get('update_frequency_id')
        self.conservation = data.get('conservation')
        self.analysis_axis = data.get(
            'analysis_axis') if data.get('analysis_axis') else []
        self.expositions = data.get('expositions')
        self.origin_id = data.get('origin_id')
        self.origin_applications = data.get('origin_applications')
        self.is_reference = data.get('is_reference') if data.get('is_reference') else False

    @staticmethod
    def from_dict(data):
        return DataSource(
            id=data.get('id'),
            name=data.get('name'),
            description=data.get('description'),
            application_id=data.get('application_id'),
            families=data.get('families') if data.get('families') else [],
            reutilizations=data.get(
                'reutilizations') if data.get('reutilizations') else [],
            type_id=data.get('type_id'),
            example=data.get('example'),
            sensibility_id=data.get('sensibility_id'),
            open_data_id=data.get('open_data_id'),
            database_name=data.get('database_name'),
            database_table_name=data.get('database_table_name'),
            database_table_count=data.get('database_table_count'),
            fields=data.get('fields'),
            field_count=data.get('field_count'),
            volumetry=data.get('volumetry'),
            volumetry_comment=data.get('volumetry_comment'),
            monthly_volumetry=data.get('monthly_volumetry'),
            monthly_volumetry_comment=data.get('monthly_volumetry_comment'),
            update_frequency_id=data.get('update_frequency_id'),
            conservation=data.get('conservation'),
            analysis_axis=data.get(
                'analysis_axis') if data.get('analysis_axis') else [],
            expositions=data.get('expositions'),
            origin_id=data.get('origin_id'),
            origin_applications=data.get('origin_applications'),
            is_reference=data.get('is_reference') if data.get('is_reference') else False,
            tags = data.get('tags') if data.get('tags') else []
        )

    @classmethod
    def filter_import_dict(cls, import_dict):
        new_import_dict = super().filter_import_dict(import_dict)
        # we need to remove these keys because they do not have setters (but can still be exported)
        if "referentiel_name" in new_import_dict:
            del new_import_dict["referentiel_name"]
        return new_import_dict

    @validates('families')
    def validate_families(self, key, families):
        if not families:
            raise AssertionError(
                "La donnée doit contenir au moins une famille")
        else:
            return families

    @validates('type_id')
    def validate_type_id(self, key, type_id):
        if not type_id:
            raise AssertionError("La donnée doit contenir un type")
        else:
            return type_id

    @validates('database_table_count')
    def validate_database_table_count(self, key, database_table_count):
        if not database_table_count:
            return None
        elif isinstance(database_table_count, int):
            return database_table_count
        else:
            try:
                return int(database_table_count)
            except:
                raise ValueError(
                    "Le nombre de table dans la base de données doit être un entier")

    @validates('field_count')
    def validate_field_count(self, key, field_count):
        if not field_count:
            return None
        elif isinstance(field_count, int):
            return field_count
        else:
            try:
                return int(field_count)
            except:
                raise ValueError(
                    "Le nombre de champs de la table doit être un entier")

    @validates('volumetry')
    def validate_volumetry(self, key, volumetry):
        if not volumetry:
            return None
        elif isinstance(volumetry, int):
            return volumetry
        else:
            try:
                return int(volumetry)
            except:
                raise ValueError("La volumétrie doit être un entier")

    @validates('monthly_volumetry')
    def validate_monthly_volumetry(self, key, monthly_volumetry):
        if not monthly_volumetry:
            return None
        elif isinstance(monthly_volumetry, int):
            return monthly_volumetry
        else:
            try:
                return int(monthly_volumetry)
            except:
                raise ValueError("La production par mois doit être un entier")

    @staticmethod
    def get_foreign_key_column(name_enum):
        for column in inspect(DataSource).c:
            if name_enum.lower() in str(column.foreign_keys):
                return column
        return None

    @classmethod
    def delete_all(cls):
        db.session.execute("DELETE FROM association_family")
        db.session.execute("DELETE FROM association_analysis_axis")
        db.session.execute("DELETE FROM association_reutilization")
        db.session.execute("DELETE FROM association_exposition")
        db.session.execute("DELETE FROM association_tag")
        db.session.execute("DELETE FROM origin_application")
        super().delete_all()

    def __repr__(self):
        return '<DataSource {}>'.format(self.name)
