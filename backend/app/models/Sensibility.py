from app import db
from app.models import EnumerationMixin


class Sensibility(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref=db.backref('sensibility', lazy='joined'), lazy='select')
