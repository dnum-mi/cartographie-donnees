from app import db
from app.models import EnumerationMixin


class Exposition(EnumerationMixin):
    @staticmethod
    def from_dict(data):
        return Exposition(
            value=data.get('value')
        )
