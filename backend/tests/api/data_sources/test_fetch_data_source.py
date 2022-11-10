
def test_fetch_data_source_unauthorized(client):
    response = client.get("/api/data-sources")
    assert response.status_code == 401


def test_fetch_data_source_user(client, user_auth_header, sample_data_sources):
    response = client.get("/api/data-sources", headers=user_auth_header)
    assert response.status_code == 200
    assert response.json['total_count'] == 0
    assert len(response.json['results']) == 0


def test_fetch_data_source_admin(client, admin_auth_header, sample_data_sources):
    response = client.get("/api/data-sources", headers=admin_auth_header)
    assert response.status_code == 200
    assert response.json['total_count'] == 2
    assert len(response.json['results']) == 2
    assert response.json['results'] == [
        data_source.to_dict()
        for data_source in sample_data_sources
    ]

