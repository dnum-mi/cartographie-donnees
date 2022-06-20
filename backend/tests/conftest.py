import pytest
from backend import app


@pytest.fixture()
def testing_app():
    app.config.update({
        "TESTING": True,
    })
    yield app


@pytest.fixture()
def client(testing_app):
    return testing_app.test_client()


@pytest.fixture()
def runner(testing_app):
    return testing_app.test_cli_runner()
