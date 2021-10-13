from app import db
from app.models import EnumerationMixin


class Type(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='type', lazy='dynamic')

    @staticmethod
    def from_dict(data):
        return Type(
            value=data.get('value')
        )
