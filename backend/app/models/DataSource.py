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
    __searchable__ = ['name', 'description', 'family_name', "classification_name", 'type_name', 'referentiel_name', 'sensibility_name',
                      'open_data_name', 'exposition_name', 'origin_name', 'application_name', 'application_potential_experimentation',
                      'organization_name', 'application_goals', 'tag_name']

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

    @property
    def type_name(self):
        return self.type.full_path if self.type else None

    @type_name.setter
    def type_name(self, type_name):
        if not type_name:
            raise ValueError("Le type est un champ obligatoire.")
        new_type = Type.query.filter_by(value=type_name).first()
        if not new_type:
            raise ValueError("Le type '{}' n'existe pas.".format(type_name))
        self.type_id = new_type.id

    @property
    def family_name(self):
        return [family.full_path for family in self.families] if self.families else []

    @family_name.setter
    def family_name(self, family_name):
        if not family_name:
            raise ValueError("La famille est un champ obligatoire.")
        new_families = []
        for family in family_name.split(","):
            new_family = Family.query.filter_by(value=family).first()
            if not new_family:
                raise ValueError(
                    "La famille '{}' n'existe pas.".format(family))
            new_families.append(new_family)
        self.families = new_families

    @property
    def classification_name(self):
        return [classification.full_path for classification in self.classifications] if self.classifications else []

    @classification_name.setter
    def classification_name(self, classification_name):
        if classification_name:
            new_classifications = []
            for classification in classification_name.split(","):
                new_classification = Family.query.filter_by(
                    value=classification).first()
                if not new_classification:
                    raise ValueError(
                        "Le réferentiel '{}' n'existe pas.".format(classification))
                new_classifications.append(new_classification)
            self.classifications = new_classifications
        else:
            self.classifications = []

    @property
    def tag_name(self):
        return [tag.full_path for tag in self.tags] if self.tags else []

    @tag_name.setter
    def tag_name(self, tag_name):
        if tag_name:
            new_tags = []
            for tag in tag_name.split(","):
                new_tag = Tag.query.filter_by(value=tag).first()
                if not new_tag:
                    raise ValueError("Le tag '{}' n'existe pas.".format(tag))
                new_tags.append(new_tag)
            self.tags = new_tags
        else:
            self.tags = []

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
    def referentiel_name(self):
        return self.referentiel.full_path if self.referentiel else None

    @referentiel_name.setter
    def referentiel_name(self, referentiel_name):
        if referentiel_name:
            referentiel_id = Family.query.filter_by(
                value=referentiel_name).first()
            if not referentiel_id:
                raise ValueError(
                    "Le référentiel '{}' n'existe pas.".format(referentiel_name))
            self.referentiel_id = referentiel_id.id
        else:
            self.referentiel_id = None

    @property
    def sensibility_name(self):
        return self.sensibility.full_path if self.sensibility else None

    @sensibility_name.setter
    def sensibility_name(self, sensibility_name):
        if sensibility_name:
            sensibility_id = Sensibility.query.filter_by(
                value=sensibility_name).first()
            if not sensibility_id:
                raise ValueError(
                    "Le sensibilité '{}' n'existe pas.".format(sensibility_name))
            self.sensibility_id = sensibility_id.id
        else:
            self.sensibility_id = None

    @property
    def open_data_name(self):
        return self.open_data.full_path if self.open_data else None

    @open_data_name.setter
    def open_data_name(self, open_data_name):
        if open_data_name:
            open_data_id = OpenData.query.filter_by(
                value=open_data_name).first()
            if not open_data_id:
                raise ValueError(
                    "Le open data '{}' n'existe pas.".format(open_data_name))
            self.open_data_id = open_data_id.id
        else:
            self.open_data_id = None

    @property
    def update_frequency_name(self):
        return self.update_frequency.full_path if self.update_frequency else None

    @update_frequency_name.setter
    def update_frequency_name(self, update_frequency_name):
        if update_frequency_name:
            update_frequency_id = UpdateFrequency.query.filter_by(
                value=update_frequency_name).first()
            if not update_frequency_id:
                raise ValueError(
                    "Le fréquence de mise à jour '{}' n'existe pas.".format(update_frequency_name))
            self.update_frequency_id = update_frequency_id.id
        else:
            self.update_frequency_id = None

    @property
    def exposition_name(self):
        return [exposition.full_path for exposition in self.expositions] if self.expositions else []

    @exposition_name.setter
    def exposition_name(self, exposition_name):
        if exposition_name:
            new_expositions = []
            for exposition in exposition_name.split(","):
                new_exposition = Exposition.query.filter_by(
                    value=exposition).first()
                if not new_exposition:
                    raise ValueError(
                        "L'exposition '{}' n'existe pas.".format(exposition))
                new_expositions.append(new_exposition)
            self.expositions = new_expositions
        else:
            self.expositions = []

    @property
    def origin_name(self):
        return self.origin.full_path if self.origin else None

    @origin_name.setter
    def origin_name(self, origin_name):
        if origin_name:
            origin_id = Origin.query.filter_by(value=origin_name).first()
            if not origin_id:
                raise ValueError(
                    "L'origine '{}' n'existe pas.".format(origin_name))
            self.origin_id = origin_id.id
        else:
            self.origin_id = None

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
