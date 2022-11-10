from elasticmock import elasticmock

from tests.constants import DEFAULT_DATA_SOURCE


def test_create_data_source_unauthorized(client):
    response = client.post("/api/data-sources", json=DEFAULT_DATA_SOURCE)
    assert response.status_code == 401


# def test_create_data_source_forbidden(client, user_auth_header, sample_applications, sample_family, sample_type):
#     response = client.post("/api/data-sources", headers=user_auth_header, json=DEFAULT_DATA_SOURCE)
#     assert response.status_code == 403
# TODO: simple admin should not be able to create data source with application he doesn't own
# TODO: uncomment when fixed

def test_create_data_source_without_type(client, user_auth_header, sample_applications, sample_family, sample_type):
    new_ds_with_non_existing_type = {**DEFAULT_DATA_SOURCE, 'type_name': 'type9'}
    response = client.post("/api/data-sources", headers=user_auth_header, json=new_ds_with_non_existing_type)
    assert response.status_code == 400
    assert response.json['description'] == "La valeur 'type9' filtre type n'existe pas."


def test_create_data_source_without_family(client, user_auth_header, sample_applications, sample_family, sample_type):
    new_ds_with_non_existing_family = {**DEFAULT_DATA_SOURCE, 'family_name': ['family9']}
    response = client.post("/api/data-sources", headers=user_auth_header, json=new_ds_with_non_existing_family)
    assert response.status_code == 400
    assert response.json['description'] == "La valeur 'family9' filtre family n'existe pas."


def test_create_data_source_success(client, admin_auth_header, sample_applications, sample_family, sample_type):
    response = client.post("/api/data-sources", headers=admin_auth_header, json=DEFAULT_DATA_SOURCE)
    assert response.status_code == 200
    assert 'id' in response.json
