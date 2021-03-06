from app import db
from app.models import BaseModel

from sqlalchemy.orm import validates


class EnumerationMixin(BaseModel):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    value = db.Column(db.String, nullable=False, unique=True)

    @validates('value')
    def validate_value(self, key, value):
        if isinstance(value, str) and value.find(",") != -1:
            raise ValueError("La valeur d'un filtre ne doit pas contenir de virgule")
        else:
            return value

    def __repr__(self):
        return '<Enumeration {}>'.format(self.value)

    def to_dict(self):
        return {
            'value': self.value,
            'id': self.id
        }

    def to_export(self):
        return {
            'value': self.value,
        }

    def update_from_dict(self, data):
        # An enumeration category cannot be changed
        # The administrator has to delete and recreate it
        self.value = data.get('value')
