from tests.constants import DEFAULT_DATA_SOURCE


def test_modify_data_source_unauthorized(client):
    response = client.put("/api/data-sources/1", json=DEFAULT_DATA_SOURCE)
    assert response.status_code == 401


def test_modify_data_source_forbidden(client, user_auth_header, sample_data_sources):
    response = client.put("/api/data-sources/1", headers=user_auth_header, json=DEFAULT_DATA_SOURCE)
    assert response.status_code == 403


def test_modify_data_source_success(client, admin_auth_header, sample_applications, sample_family, sample_type, sample_data_sources):
    response = client.put("/api/data-sources/1", headers=admin_auth_header, json=DEFAULT_DATA_SOURCE)
    assert response.status_code == 200
    assert response.json['id'] == 1
    assert response.json['name'] == DEFAULT_DATA_SOURCE['name']
    assert response.json['application']['name'] == DEFAULT_DATA_SOURCE['application']['name']
    assert response.json['application']['id'] == sample_applications[0].id
    assert response.json['families'][0]['id'] == sample_family.id
    assert response.json['type_name'] == sample_type.full_path
