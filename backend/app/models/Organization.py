from app import db
from app.models import EnumerationMixin


class Organization(EnumerationMixin):
    applications = db.relationship('Application', backref='organization', lazy='dynamic')

    @staticmethod
    def from_dict(data):
        return Organization(
            value=data.get('value')
        )
