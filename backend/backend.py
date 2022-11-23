from app import create_app
from app.models import Application
from app.models import DataSource

app = create_app()

with app.app_context():
    print("Indexing elasticsearch...")
    # Application.reindex()
    # DataSource.reindex()
    print("Indexing ended...")
