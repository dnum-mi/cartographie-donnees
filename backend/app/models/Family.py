from app import db
from app.models import EnumerationMixin


class Family(EnumerationMixin):
    # data_sources = db.relationship('DataSource', backref='referentiel_test', lazy='dynamic')
    pass
