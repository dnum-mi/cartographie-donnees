from app import db
from app.models import EnumerationMixin


class Origin(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref='origin', lazy='dynamic')

