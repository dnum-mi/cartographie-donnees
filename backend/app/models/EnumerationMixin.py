from app import db
from app.constants import FULL_PATH_DELIMITER
from app.models import BaseModel

from sqlalchemy.orm import validates
from sqlalchemy.ext.declarative import declared_attr


class EnumerationMixin(BaseModel):

    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    value = db.Column(db.String, nullable=False, unique=True)

    @declared_attr
    def parent_id(cls):
        return db.Column(
            db.Integer,
            db.ForeignKey(f'{cls.__tablename__}.id'),
            nullable=True,
        )

    @declared_attr
    def children(cls):
        return db.relationship(
            cls.__name__,
            backref=db.backref('parent', remote_side=f'{cls.__name__}.id'),
        )

    @property
    def full_path(self):
        if self.parent_id is None:
            return self.value
        return f'{self.parent.full_path} {FULL_PATH_DELIMITER} {self.value}'

    @validates('value')
    def validate_value(self, key, value):
        if isinstance(value, str) and value.find(",") != -1:
            raise ValueError("La valeur d'un filtre ne doit pas contenir de virgule")
        else:
            return value

    def __repr__(self):
        return f'<{type(self).__name__} {self.value}>'

    def to_dict(self):
        return {
            'value': self.value,
            'full_path': self.full_path,
            'id': self.id
        }

    def to_export(self):
        return {
            'full_path': self.full_path,
        }

    def update_from_dict(self, data):
        value, parent = self.get_value_and_parent_from_full_path(data['full_path'])
        self.value = value
        if parent:
            parent.children.append(self)

    @classmethod
    def get_or_create_parent_from_full_path(cls, full_path):
        all_enumerations = cls.query.all()
        parents_list = [enumeration for enumeration in all_enumerations if enumeration.full_path == full_path]
        if len(parents_list) > 0:
            return parents_list[0]
        parent = cls.from_dict({'full_path': full_path})
        db.session.add(parent)
        return parent

    @classmethod
    def get_value_and_parent_from_full_path(cls, full_path):
        if FULL_PATH_DELIMITER in full_path:
            splitted = full_path.rsplit(FULL_PATH_DELIMITER, 1)
            parent = cls.get_or_create_parent_from_full_path(splitted[0].strip())
            value = splitted[1].strip()
        else:
            value = full_path.strip()
            parent = None
        return value, parent

    @classmethod
    def from_dict(cls, data):
        value, parent = cls.get_value_and_parent_from_full_path(data['full_path'])
        new_enumeration = cls(value=value)
        if parent:
            parent.children.append(new_enumeration)
        return new_enumeration
