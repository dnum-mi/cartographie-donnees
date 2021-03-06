from app import db
from app.models import EnumerationMixin


class Origin(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='origin', lazy='dynamic')

    @staticmethod
    def from_dict(data):
        return Origin(
            value=data.get('value')
        )
