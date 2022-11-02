from app import db
from app.models import BaseModel


class RoutingKPI(BaseModel):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pathname = db.Column(db.String, nullable=False)
    subpath = db.Column(db.String, nullable=True)
    search = db.Column(db.String, nullable=True)
    is_general_admin = db.Column(db.Boolean, nullable=False)
    is_simple_admin = db.Column(db.Boolean, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    # see application validation_date

    def from_dict(data):
        routing_kpi = RoutingKPI(
            id=data.get("id"),
            pathname=data.get("pathname"),
            subpath=data.get("subpath"),
            search=data.get("search"),
            is_general_admin=data.get("is_general_admin"),
            is_simple_admin=data.get("is_simple_admin"),
            date=data.get("date"),
        )
        return routing_kpi

    def to_dict(self):
        result = {
            'id': self.id,
            'pathname': self.pathname,
            'subpath': self.subpath,
            'search': self.search,
            'is_general_admin': self.is_general_admin,
            'is_simple_admin': self.is_simple_admin,
            'date': self.date,
        }
        return result

    def update_from_dict(self, data):
        self.id = data.get('id')
        self.pathname = data.get('pathname')
        self.subpath = data.get('subpath')
        self.search = data.get('search')
        self.is_general_admin = data.get('is_general_admin')
        self.is_simple_admin = data.get('is_simple_admin')
        self.date = data.get('date')

    def to_export(self):
        routing_kpi_dict = self.to_dict()
        return routing_kpi_dict
