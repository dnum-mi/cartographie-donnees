from statistics import mean

from sqlalchemy.orm import validates, object_session
from sqlalchemy.ext.hybrid import hybrid_property

from app import db
from app.models import User, BaseModel, Organization, SearchableMixin
import datetime


ownerships = db.Table(
    'ownerships',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('application_id', db.Integer, db.ForeignKey('application.id'), primary_key=True),
    db.UniqueConstraint('user_id', 'application_id')
)


class Application(SearchableMixin, BaseModel):
    __search_index_fields__ = ['name', "goals", 'organization_name', 'long_name']
    __text_search_fields__ = ['name', "goals", 'organization_name', 'long_name']
    __search_count__ = ['organization_name']

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False, unique=True)
    long_name = db.Column(db.String)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'))
    goals = db.Column(db.Text, nullable=False)
    access_url = db.Column(db.Text)
    operator_count = db.Column(db.Integer)
    operator_count_comment = db.Column(db.String)
    user_count = db.Column(db.Integer)
    user_count_comment = db.Column(db.String)
    monthly_connection_count = db.Column(db.Integer)
    monthly_connection_count_comment = db.Column(db.String)
    context_email = db.Column(db.Text)
    owners = db.relationship('User', secondary=ownerships, lazy='joined', backref=db.backref('applications', lazy='select'))
    validation_date = db.Column(db.DateTime, nullable=True)
    historic = db.Column(db.Integer, nullable=True)
    data_sources = db.relationship('DataSource', backref='application', lazy='dynamic', foreign_keys='DataSource.application_id')

    @hybrid_property
    def references(self):
        return [ds for ds in self.data_sources if ds.is_reference]

    @property
    def organization_long_name(self):
        if self.organization.label is not None:
            return self.organization.label
        else:
            return self.organization.value

    @property
    def organization_name(self):
        return self.organization.full_path

    @organization_name.setter
    def organization_name(self, organization_name):
        if not organization_name:
            raise ValueError("L'organisation est un champ obligatoire.")
        organizations = [org for org in Organization.query.all() if org.full_path == organization_name]
        if len(organizations) == 0:
            raise ValueError("L'organisation '{}' n'existe pas.".format(organization_name))
        self.organization_id = organizations[0].id

    @hybrid_property
    def data_source_count(self):
        return self.data_sources.count()

    @hybrid_property
    def referentiel_count(self):
        return self.data_sources.filter_by(is_reference=True).count()

    @hybrid_property
    def reutilization_count(self):
        from app.models.DataSource import DataSource, association_reutilization_table
        return object_session(self) \
            .query(association_reutilization_table) \
            .distinct(association_reutilization_table.c.application_id) \
            .join(DataSource) \
            .filter(DataSource.application_id == self.id) \
            .count()

    @hybrid_property
    def application_description_level(self):
        if self.data_source_count == 0:
            return 0
        else:
            return round(
                mean([ds.datasource_description_level for ds in self.data_sources]),
                2
            )

    @validates('access_url')
    def validate_access_url(self, key, access_url):
        if not access_url:
            return access_url
        elif "http" not in access_url:
            raise AssertionError("Veuillez saisir un url valide")
        else:
            return access_url

    @validates('context_email')
    def validate_context_email(self, key, context_email):
        if not context_email:
            return context_email

        index = context_email.find("@")
        if index == -1:
            raise AssertionError("Veuillez inclure le caractère @ dans l'addresse mail")
        elif index == 0:
            raise AssertionError("Veuillez inclure des caractères avant le @ dans l'addesse mail")
        elif index == len(context_email) - 1:
            raise AssertionError("Veuillez inclure des caractères après le @ dans l'addesse mail")
        elif " " in context_email[:index]:
            raise AssertionError("Veuillez na pas inclure le caractère \" \" avant le @ dans l'addesse mail")
        elif " " in context_email[index:]:
            raise AssertionError("Veuillez na pas inclure le caractère \" \" après le @ dans l'addesse mail")
        elif "/" in context_email[index:]:
            raise AssertionError("Veuillez na pas inclure le caractère \"/\" après le @ dans l'addesse mail")
        elif "\\" in context_email[index:]:
            raise AssertionError("Veuillez na pas inclure le caractère \"\\\" après le @ dans l'addesse mail")
        elif ";" in context_email[index:]:
            raise AssertionError("Veuillez na pas inclure le caractère \";\" après le @ dans l'addesse mail")
        elif "," in context_email[index:]:
            raise AssertionError("Veuillez na pas inclure le caractère \",\" après le @ dans l'addesse mail")
        else:
            return context_email

    def to_dict(self, populate_data_sources=False, populate_owners=True, populate_statistics=False):
        result = {
            'id': self.id,
            'name': self.name,
            'long_name': self.long_name,
            'goals': self.goals,
            'access_url': self.access_url,
            'organization_name': self.organization_name,
            'organization_long_name': self.organization_long_name,
            'context_email': self.context_email,
            'operator_count': self.operator_count,
            'operator_count_comment': self.operator_count_comment,
            'user_count': self.user_count,
            'user_count_comment': self.user_count_comment,
            'monthly_connection_count': self.monthly_connection_count,
            'monthly_connection_count_comment': self.monthly_connection_count_comment,
            'historic': self.historic,
            'validation_date': self.validation_date.strftime("%d/%m/%Y") if self.validation_date else None,
        }

        if populate_statistics:
            # Those statistics are expensive to compute
            result = {
                **result,
                'data_source_count': self.data_source_count,
                'referentiel_count': self.referentiel_count,
                'reutilization_count': self.reutilization_count,
                'application_description_level': self.application_description_level,
            }
        if populate_data_sources:
            result['data_sources'] = [
                data_source.to_dict()
                for data_source in sorted(self.data_sources, key=lambda ds: str.lower(ds.name))
            ]
        if populate_owners:
            result['owners'] = [
                owner.to_dict()
                for owner in sorted(self.owners, key=lambda user: str.lower(user.last_name))
            ]
        return result

    def to_export(self):
        application_dict = self.to_dict(populate_owners=True, populate_statistics=True)
        application_dict['owners'] = ",".join([owner['email'] for owner in application_dict['owners']])
        del application_dict["id"]
        del application_dict["organization_long_name"]
        return application_dict

    def update_from_dict(self, data):
        self.name = data.get('name')
        self.long_name = data.get('long_name')
        self.organization_id = data.get('organization_id')
        self.goals = data.get('goals')
        self.access_url = data.get('access_url')
        self.operator_count = data.get('operator_count')
        self.user_count = data.get('user_count')
        self.monthly_connection_count = data.get('monthly_connection_count')
        self.operator_count_comment = data.get("operator_count_comment")
        self.user_count_comment = data.get("user_count_comment")
        self.monthly_connection_count_comment = data.get('monthly_connection_count_comment')
        self.context_email = data.get('context_email')
        self.validation_date = data.get('validation_date')
        self.historic = data.get('historic')
        if "owners" in data:
            self.owners = [User.query.get(owner['id']) for owner in data.get('owners')]

    def update_from_key_value(self, key, value):
        setattr(self, key, value)

    @staticmethod
    def from_dict(data):
        application = Application(
            id=data.get('id'),
            name=data.get('name'),
            long_name=data.get('long_name'),
            organization_id=data.get('organization_id'),
            goals=data.get('goals'),
            access_url=data.get('access_url'),
            operator_count=data.get('operator_count'),
            user_count=data.get('user_count'),
            operator_count_comment=data.get('operator_count_comment'),
            user_count_comment=data.get('user_count_comment'),
            monthly_connection_count=data.get('monthly_connection_count'),
            monthly_connection_count_comment=data.get('monthly_connection_count_comment'),
            context_email=data.get('context_email'),
            validation_date=data.get('validation_date'),
            historic=data.get('historic')
        )
        if data.get('owners'):
            application.owners = [User.query.get(owner['id']) for owner in data.get('owners')]
        return application

    @classmethod
    def filter_import_dict(cls, import_dict):
        new_import_dict = super().filter_import_dict(import_dict)

        # Remove fields added in export
        added_fields = ['data_source_count','referentiel_count','reutilization_count','application_description_level']
        for key in added_fields:
            if key in new_import_dict:
                del new_import_dict[key]

        if import_dict['owners']:
            # Transform owners string into an array of emails
            owner_emails = import_dict['owners'].split(',')
            # Replace owners' emails by owners' ids
            owners_ids = []
            for owner_email in owner_emails:
                user = User.query.filter_by(email=owner_email).first()
                if user is None:
                    raise ValueError("L'adresse email {} ne correspond "
                                     "à aucun administrateur".format(owner_email))
                owners_ids.append(user)
            new_import_dict['owners'] = owners_ids
        else:
            new_import_dict['owners'] = []
        return new_import_dict

    @validates('operator_count')
    def validate_operator_count(self, key, operator_count):
        if not operator_count:
            return None
        elif isinstance(operator_count, int):
            return operator_count
        else:
            try:
                return int(operator_count)
            except:
                raise ValueError("Le nombre d'opérateurs dans la base de données doit être un entier")

    @validates('user_count')
    def validate_user_count(self, key, user_count):
        if not user_count:
            return None
        elif isinstance(user_count, int):
            return user_count
        else:
            try:
                return int(user_count)
            except:
                raise ValueError("Le nombre d'utilisateurs dans la base de données doit être un entier")

    @validates('monthly_connection_count')
    def validate_monthly_connection_count(self, key, monthly_connection_count):
        if not monthly_connection_count:
            return monthly_connection_count
        elif isinstance(monthly_connection_count, int):
            return monthly_connection_count
        else:
            try:
                return int(monthly_connection_count)
            except:
                raise ValueError("Le production mensuelle dans la base de données doit être un entier")

    @validates('historic')
    def validate_historic(self, key, historic):
        if not historic:
            return historic
        elif isinstance(historic, int):
            return historic
        else:
            try:
                return int(historic)
            except:
                raise ValueError("L'historique dans la base de données doit être une année")

    @validates('validation_date')
    def validate_validation_date(self, key, validation_date):
        if not validation_date:
            return validation_date
        else:
            if isinstance(validation_date, datetime.date):
                return validation_date
            else:
                raise ValueError("La date de validation doit être sous le format jj/mm/aaaa")

    @classmethod
    def delete_all(cls):
        db.session.execute("DELETE FROM ownerships")
        super().delete_all()

    def __repr__(self):
        return '<Application {}>'.format(self.name)
