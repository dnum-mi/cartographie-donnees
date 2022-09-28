from app import db
from app.models import BaseModel

class WildCard(BaseModel):
    namespace = db.Column(db.String, nullable=False, primary_key = True)
    key = db.Column(db.String, nullable=False, primary_key = True)
    value = db.Column(db.String)

    def from_dict(data):
        wild_card = WildCard(
            namespace= data.get("namespace"),
            key= data.get("key"),
            value= data.get("value")
        )
        return wild_card

    def to_dict(self):
        result = {
            'namespace': self.namespace,
            'key': self.key,
            'value': self.value
        }

        return result

    def update_from_dict(self, data):
        self.namespace = data.get('namespace')
        self.key = data.get('key')
        self.value = data.get('value')

    def to_export(self):
        wild_card_dict = self.to_dict()
        return wild_card_dict
