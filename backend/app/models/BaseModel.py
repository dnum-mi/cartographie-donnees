from app import db


class BaseModel(db.Model):
    __abstract__ = True

    @classmethod
    def delete_all(cls):
        db.session.query(cls).delete(synchronize_session='fetch')

    @classmethod
    def filter_import_dict(cls, import_dict):
        deep_copy = {k: v for (k, v) in import_dict.items()}
        if 'id' in deep_copy:
            del deep_copy['id']
        return deep_copy
