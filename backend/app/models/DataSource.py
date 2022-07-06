from sqlalchemy.inspection import inspect
from sqlalchemy import select
from sqlalchemy.orm import validates, relationship
from sqlalchemy.ext.associationproxy import association_proxy
from app import db
from app.models import SearchableMixin, BaseModel, Type, Application, OpenData, Family, UpdateFrequency, Origin, Exposition, Sensibility, Tag


association_classification_table = db.Table(
    'association_classification', db.Model.metadata,
    db.Column('data_source_id', db.Integer, db.ForeignKey('data_source.id')),
    db.Column('family_id', db.Integer, db.ForeignKey('family.id')),
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


class DataSource(SearchableMixin, BaseModel):
    __searchable__ = ['name', 'description', 'family_name', "classification_name", 'type_name', 'referentiel_name',
                      'sensibility_name', 'open_data_name', 'exposition_name', 'origin_name', 'application_name',
                      'application_potential_experimentation', 'organization_name', 'application_goals', 'tag_name']
    __search_count__ = ['family_name', "classification_name", 'type_name', 'referentiel_name', 'sensibility_name',
                        'open_data_name', 'exposition_name', 'origin_name', 'application_name',
                        'organization_name', 'tag_name']

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, server_default="", nullable=False)
    description = db.Column(db.Text)
    families = db.relationship("Family",
                               secondary=association_family_table,
                               backref="data_sources", cascade="all, delete")
    type_id = db.Column(db.Integer, db.ForeignKey('type.id'))
    ministry_interior = db.Column(db.Boolean, default=False)
    geo_localizable = db.Column(db.Boolean, default=False)
    transformation = db.Column(db.Boolean, default=False)
    example = db.Column(db.Text)
    referentiel_id = db.Column(db.Integer, db.ForeignKey('family.id'))
    referentiel = relationship(
        "Family", foreign_keys='DataSource.referentiel_id')
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
    classifications = db.relationship("Family",
                                      secondary=association_classification_table, cascade="all, delete")
    origin_id = db.Column(db.Integer, db.ForeignKey('origin.id'))
    expositions = db.relationship("Exposition",
                                  secondary=association_exposition_table, cascade="all, delete")
    reutilizations = db.relationship("Application",
                                     secondary=association_reutilization_table,
                                     backref="data_source_reutilizations", cascade="all, delete")
    origin_application_id = db.Column(
        db.Integer, db.ForeignKey('application.id'))
    tags = db.relationship("Tag",
                           secondary=association_tag_table,
                           backref="data_sources", cascade="all, delete")

    application_id = db.Column(db.Integer, db.ForeignKey(
        'application.id'), nullable=False)
    owners = association_proxy('application', 'owners')

    @property
    def nb_reutilizations(self):
        return len(self.reutilizations)

    @property
    def nb_referentiels(self):
        return len(self.classifications)

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
    def classification_name(self):
        return self.get_enumeration_multiple('classifications')

    @classification_name.setter
    def classification_name(self, classification_name):
        self.set_enumeration_multiple(classification_name, 'classifications', Family, 'Le référentiel')

    @property
    def tag_name(self):
        return self.get_enumeration_multiple('tags')

    @tag_name.setter
    def tag_name(self, tag_name):
        self.set_enumeration_multiple(tag_name, 'tags', Tag, 'Le tag')

    @property
    def referentiel_name(self):
        return self.get_enumeration_single('referentiel')

    @referentiel_name.setter
    def referentiel_name(self, referentiel_name):
        self.set_enumeration_single(referentiel_name, 'referentiel', Family, 'Le référentiel')

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
        return self.origin_application.name if self.origin_application else None

    @origin_application_name.setter
    def origin_application_name(self, application_name):
        if application_name:
            application_id = Application.query.filter_by(
                name=application_name).first()
            if not application_id:
                raise ValueError(
                    "L'application '{}' n'existe pas.".format(application_name))
            self.origin_application_id = application_id.id
        else:
            self.origin_application_id = None

    @property
    def application_potential_experimentation(self):
        return self.application.potential_experimentation

    @property
    def organization_name(self):
        return self.application.organization_name

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

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'ministry_interior': self.ministry_interior,
            'geo_localizable': self.geo_localizable,
            'application_name': self.application_name,
            'origin_application_name': self.origin_application_name,
            'family_name': self.family_name,
            'tag_name': self.tag_name,
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
            'update_frequency_name': self.update_frequency_name,
            'conservation': self.conservation,
            'classification_name': self.classification_name,
            'nb_referentiels': self.nb_referentiels,
            'exposition_name': self.exposition_name,
            'origin_name': self.origin_name,
            'application': self.application.to_dict(),
            'organization_name': self.application.organization_name,
            'origin_application': self.origin_application.to_dict() if self.origin_application else None,
            'transformation': self.transformation,
            'reutilizations': [application.to_dict() for application in self.reutilizations],
            'nb_reutilizations': self.nb_reutilizations
        }

    def to_export(self):
        return {
            'name': self.name,
            'description': self.description,
            'ministry_interior': self.ministry_interior,
            'geo_localizable': self.geo_localizable,
            'application_name': self.application_name,
            'reutilization_name': ",".join(self.reutilization_name),
            'family_name': ",".join(self.family_name),
            'tag_name': ",".join(self.tag_name),
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
            'update_frequency_name': self.update_frequency_name,
            'conservation': self.conservation,
            'classification_name': ",".join(self.classification_name),
            'exposition_name': ",".join(self.exposition_name),
            'origin_name': self.origin_name,
            'origin_application_name': self.origin_application_name,
            'transformation': self.transformation,
        }

    def update_from_dict(self, data):
        self.name = data.get('name')
        self.description = data.get('description')
        self.ministry_interior = data.get('ministry_interior')
        self.geo_localizable = data.get('geo_localizable')
        self.application_id = data.get('application_id')
        self.families = data.get('families') if data.get('families') else []
        self.reutilizations = data.get(
            'reutilizations') if data.get('reutilizations') else []
        self.tags = data.get('tags') if data.get('tags') else []
        self.type_id = data.get('type_id')
        self.example = data.get('example')
        self.referentiel_id = data.get('referentiel_id')
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
        self.classifications = data.get(
            'classifications') if data.get('classifications') else []
        self.expositions = data.get('expositions')
        self.origin_id = data.get('origin_id')
        self.origin_application_id = data.get('origin_application_id')
        self.transformation = data.get('transformation')

    @staticmethod
    def from_dict(data):
        return DataSource(
            id=data.get('id'),
            name=data.get('name'),
            description=data.get('description'),
            ministry_interior=data.get('ministry_interior'),
            application_id=data.get('application_id'),
            families=data.get('families'),
            reutilizations=data.get('reutilizations'),
            type_id=data.get('type_id'),
            example=data.get('example'),
            referentiel_id=data.get('referentiel_id'),
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
            classifications=data.get('classifications'),
            expositions=data.get('expositions'),
            origin_id=data.get('origin_id'),
            transformation=data.get('transformation'),
            origin_application_id=data.get('origin_application_id'),
        )

    @classmethod
    def filter_import_dict(cls, import_dict):
        new_import_dict = super().filter_import_dict(import_dict)
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

    @validates('geo_localizable')
    def validate_geo_localizable(self, key, geo_localizable):
        if not geo_localizable:
            return geo_localizable
        elif isinstance(geo_localizable, bool):
            return geo_localizable
        else:
            raise ValueError("Géolocalisable ? doit être un booléen")

    @validates('ministry_interior')
    def validate_ministry_interior(self, key, ministry_interior):
        if not ministry_interior:
            return ministry_interior
        elif isinstance(ministry_interior, bool):
            return ministry_interior

    @validates('transformation')
    def validate_transformation(self, key, transformation):
        if not transformation:
            return transformation
        elif isinstance(transformation, bool):
            return transformation

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

    def delete(self):
        db.session.execute(
            "DELETE FROM association_family WHERE data_source_id={}".format(self.id))
        db.session.execute(
            "DELETE FROM association_classification WHERE data_source_id={}".format(self.id))
        db.session.execute(
            "DELETE FROM association_exposition WHERE data_source_id={}".format(self.id))
        db.session.execute(
            "DELETE FROM association_reutilization WHERE data_source_id={}".format(self.id))
        db.session.execute(
            "DELETE FROM association_tag WHERE data_source_id={}".format(self.id))
        db.session.delete(self)

    @classmethod
    def delete_all(cls):
        db.session.execute("DELETE FROM association_family")
        db.session.execute("DELETE FROM association_classification")
        db.session.execute("DELETE FROM association_reutilization")
        db.session.execute("DELETE FROM association_exposition")
        db.session.execute("DELETE FROM association_tag")
        super().delete_all()

    def __repr__(self):
        return '<DataSource {}>'.format(self.name)
