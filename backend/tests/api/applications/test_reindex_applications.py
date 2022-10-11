from unittest import mock

from app.models import Application


def test_fetch_application_unauthorized(client):
    with mock.patch('app.models.Application.reindex') as reindex_mocked:
        response = client.get("/api/applications/reindex")
        assert response.status_code == 200
        reindex_mocked.assert_called_once()
