from app import db
from app.models import EnumerationMixin


class OpenData(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='open_data', lazy='dynamic')
