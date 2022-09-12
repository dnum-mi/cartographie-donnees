from app import db
from app.models import BaseModel

class WildCard(BaseModel):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String, nullable=False)
    value = db.Column(db.String)
    namespace = db.Column(db.String)
