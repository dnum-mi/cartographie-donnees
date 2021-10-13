from app import app
from app.models import Application
from app.models import DataSource

with app.app_context():
    Application.reindex()
    DataSource.reindex()
