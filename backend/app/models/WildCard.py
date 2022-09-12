from app import db
from app.models import BaseModel

class WildCard(BaseModel):
    namespace = db.Column(db.String, nullable=False, primary_key = True)
    key = db.Column(db.String, nullable=False, primary_key = True)
    value = db.Column(db.String)

