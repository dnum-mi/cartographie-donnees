from typing import Dict

import pytest

from app.models import User
from app import db, create_app
from tests.constants import ADMIN_INFO, ADMIN_CREDENTIALS


@pytest.fixture()
def testing_app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://",  # in-memory db
    })
    app_context = app.app_context()
    app_context.push()
    db.create_all()
    yield app
    db.session.remove()
    db.drop_all()
    app_context.pop()
    app.config.update({
        "TESTING": True,
    })
    yield app


@pytest.fixture()
def client(testing_app):
    return testing_app.test_client()


@pytest.fixture()
def admin_user(testing_app) -> User:
    default_admin = User.from_dict(ADMIN_INFO)
    default_admin.set_password(ADMIN_INFO['password'])
    db.session.add(default_admin)
    db.session.commit()
    db.session.refresh(default_admin)
    yield default_admin


@pytest.fixture()
def admin_auth_header(client, admin_user) -> Dict:
    response = client.post("/api/login", json=ADMIN_CREDENTIALS)
    return {'Authorization': f'Bearer {response.json["token"]}'}
