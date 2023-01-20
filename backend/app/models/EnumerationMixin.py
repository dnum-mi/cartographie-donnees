from app import db
from app.constants import FULL_PATH_DELIMITER
from app.models import BaseModel

from sqlalchemy.orm import validates
from sqlalchemy.ext.declarative import declared_attr


class EnumerationMixin(BaseModel):

    __abstract__ = True

    @declared_attr
    def __table_args__(cls):
        return tuple([db.UniqueConstraint('value', 'parent_id')])

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    value = db.Column(db.String, nullable=False)
    label = db.Column(db.String)

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
            backref=db.backref('parent', remote_side=f'{cls.__name__}.id', lazy='joined'),
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

    def to_dict(self, populate_children=False):
        return_dict = {
            'value': self.value,
            'full_path': self.full_path,
            'label': self.label,
            'id': self.id
        }
        if populate_children:
            return_dict['children'] = [
                child.to_dict(populate_children=populate_children)
                for child in self.children
            ]
        return return_dict

    def to_export(self):
        return {
            'full_path': self.full_path,
            'label': self.label,
        }

    def update_from_dict(self, data):
        value, parent = self.get_value_and_parent_from_full_path(data['full_path'])
        self.value = value
        self.label = data.get('label')
        if parent:
            parent.children.append(self)

    def get_children_recursively(self):
        rv = []
        for child in self.children:
            rv.append(child)
            if len(child.children):
                rv = rv + child.get_children_recursively()
        return rv

    def get_children_full_paths_recursively(self):
        return [child.full_path for child in self.get_children_recursively()]

    @classmethod
    def find_by_full_path(cls, full_path):
        all_records = cls.query.all()
        matches = [record for record in all_records if record.full_path == full_path]
        if len(matches) == 0:
            raise ValueError(f'Enumeration {full_path} of class {cls.__name__} not found')
        return matches[0]

    @classmethod
    def find_if_exists_by_full_path(cls, full_path):
        all_records = cls.query.all()
        matches = [record for record in all_records if record.full_path == full_path]
        return bool(len(matches))

    @classmethod
    def get_tree_dict(cls):
        """Fetch all records from db and return a tree of the results"""
        record_list = cls.query.filter_by(parent_id=None).all()
        return [
            record.to_dict(populate_children=True)
            for record in record_list
        ]

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
        new_enumeration = cls(value=value, label=data.get('label'))
        if parent:
            parent.children.append(new_enumeration)
        return new_enumeration
