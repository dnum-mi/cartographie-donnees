from app import db
from app.models import EnumerationMixin


class UpdateFrequency(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref=db.backref('update_frequency', lazy='joined'), lazy='select')
