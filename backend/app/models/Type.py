from app import db
from app.models import EnumerationMixin


class Type(EnumerationMixin):
    data_sources = db.relationship('DataSource', backref=db.backref('type', lazy='joined'), lazy='select')
