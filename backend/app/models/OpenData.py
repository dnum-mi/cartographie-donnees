from app import db
from app.models import EnumerationMixin


class OpenData(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='open_data', lazy='dynamic')

    @staticmethod
    def from_dict(data):
        return OpenData(
            value=data.get('value')
        )
