from app import db
from app.models import BaseModel
from app.constants import field_english_to_french_dic, WILDCARDS_LABELS


class WildCard(BaseModel):
    namespace = db.Column(db.String, nullable=False, primary_key=True)
    key = db.Column(db.String, nullable=False, primary_key=True)
    value = db.Column(db.String)

    def from_dict(data):
        wild_card = WildCard(
            namespace=data.get("namespace"),
            key=data.get("key"),
            value=data.get("value")
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
        wild_card_dict["label"] = WILDCARDS_LABELS.get(
            wild_card_dict["key"], field_english_to_french_dic.get(wild_card_dict["key"], "Libellé non défini")
        )
        # Reorder columns for csv
        return {
            "namespace": wild_card_dict["namespace"],
            "key": wild_card_dict["key"],
            "label": wild_card_dict["label"],
            "value": wild_card_dict["value"]
        }

    @classmethod
    def filter_import_dict(cls, import_dict):
        new_import_dict = super().filter_import_dict(import_dict)
        # we need to remove these keys because they do not have setters (but can still be exported)
        if "label" in new_import_dict:
            del new_import_dict["label"]
        return new_import_dict
