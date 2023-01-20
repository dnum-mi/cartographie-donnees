from app import db
from app.models import BaseModel


class SearchingKPI(BaseModel):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text_query = db.Column(db.String, nullable=True)
    text_operator = db.Column(db.String, nullable=True)
    exclusion = db.Column(db.String, nullable=True)
    filters_query = db.Column(db.String, nullable=True)
    date = db.Column(db.DateTime, nullable=False)

    # see application validation_date

    def from_dict(data):
        searching_kpi = SearchingKPI(
            id=data.get("id"),
            text_query=data.get("text_query"),
            text_operator=data.get("text_operator"),
            exclusion=data.get("exclusion"),
            filters_query=data.get("filters_query"),
            date=data.get("date"),
        )
        return searching_kpi

    def to_dict(self):
        result = {
            'id': self.id,
            'text_query': self.text_query,
            'text_operator': self.text_operator,
            'exclusion': self.exclusion,
            'filters_query': self.filters_query,
            'date': self.date,
        }
        return result

    def update_from_dict(self, data):
        self.id = data.get('id')
        self.text_query = data.get('text_query')
        self.text_operator = data.get('text_operator')
        self.exclusion = data.get('exclusion')
        self.filters_query = data.get('filters_query')
        self.date = data.get('date')

    def to_export(self):
        searching_kpi_dict = self.to_dict()
        return searching_kpi_dict
