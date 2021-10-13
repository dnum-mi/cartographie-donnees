from app import db
from app.models import EnumerationMixin


class Tag(EnumerationMixin):
    @staticmethod
    def from_dict(data):
        return Tag(
            value=data.get('value')
        )
