from elasticmock import elasticmock

from tests.constants import DEFAULT_APPLICATION, EMPTY_APPLICATION


def test_modify_application_unauthorized(client, sample_applications):
    response = client.put("/api/applications/1", json=DEFAULT_APPLICATION)
    assert response.status_code == 401


def test_modify_application_forbidden(client, user_auth_header):
    response = client.put("/api/applications/1", headers=user_auth_header, json=DEFAULT_APPLICATION)
    assert response.status_code == 403


def test_modify_application(client, admin_auth_header, sample_applications):
    response = client.put("/api/applications/1", headers=admin_auth_header, json=DEFAULT_APPLICATION)
    assert response.status_code == 200
    assert response.json['goals'] == DEFAULT_APPLICATION['goals']
    assert response.json['name'] == DEFAULT_APPLICATION['name']
    assert response.json['organization_name'] == DEFAULT_APPLICATION['organization_name']
