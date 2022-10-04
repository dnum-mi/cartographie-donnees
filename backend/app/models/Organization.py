from app import db
from app.models import EnumerationMixin


class Organization(EnumerationMixin):
    applications = db.relationship('Application', backref=db.backref('organization', lazy='joined'), lazy='select')
