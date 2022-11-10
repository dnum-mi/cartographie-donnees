from unittest import mock


def test_reindex_data_source(client):
    with mock.patch('app.models.DataSource.reindex') as reindex_mocked:
        response = client.get("/api/data-sources/reindex")
        assert response.status_code == 200
        reindex_mocked.assert_called_once()
