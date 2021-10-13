from app import db
from app.models import EnumerationMixin


class UpdateFrequency(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='update_frequency', lazy='dynamic')

    @staticmethod
    def from_dict(data):
        return UpdateFrequency(
            value=data.get('value')
        )
