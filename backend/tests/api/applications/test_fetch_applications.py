from tests.constants import DEFAULT_APPLICATION


def test_fetch_application_unauthorized(client):
    response = client.get("/api/applications", json=DEFAULT_APPLICATION)
    assert response.status_code == 401


def test_fetch_application(client, admin_auth_header, sample_applications):
    response = client.get("/api/applications", headers=admin_auth_header)
    assert response.status_code == 200
    assert response.json['total_count'] == 2
    assert len(response.json['results']) == 2
    assert response.json['results'] == [
        application.to_dict()
        for application in sample_applications
    ]
