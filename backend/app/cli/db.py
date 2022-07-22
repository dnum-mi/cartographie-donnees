from app import db
from app.models import BaseModel
from . import cli


@cli.cli.command("reset-db")
def reset_db():
    BaseModel.metadata.drop_all(bind=db.engine)
    db.engine.execute('DELETE FROM alembic_version')
