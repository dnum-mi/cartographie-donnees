from unittest import mock


def test_reindex_applications(client):
    with mock.patch('app.models.Application.reindex') as reindex_mocked:
        response = client.get("/api/applications/reindex")
        assert response.status_code == 200
        reindex_mocked.assert_called_once()
