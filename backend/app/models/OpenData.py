from app import db
from app.models import EnumerationMixin


class OpenData(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref=db.backref('open_data', lazy='joined'), lazy='select')
