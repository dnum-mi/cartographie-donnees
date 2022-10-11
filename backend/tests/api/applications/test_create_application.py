from elasticmock import elasticmock

from tests.constants import DEFAULT_APPLICATION, EMPTY_APPLICATION


def test_create_application_unauthorized(client):
    response = client.post("/api/applications", json=DEFAULT_APPLICATION)
    assert response.status_code == 401


def test_create_application_forbidden(client, user_auth_header):
    response = client.post("/api/applications", headers=user_auth_header, json=DEFAULT_APPLICATION)
    assert response.status_code == 403


def test_create_application_without_organization(client, admin_auth_header):
    response = client.post("/api/applications", headers=admin_auth_header, json=DEFAULT_APPLICATION)
    assert response.status_code == 400
    assert response.json['description'] == "La valeur 'MI' filtre organization n'existe pas."


# @elasticmock
# def test_create_application(client, admin_auth_header, sample_organizations):
#     response = client.post("/api/applications", headers=admin_auth_header, json=DEFAULT_APPLICATION)
#     assert response.status_code == 200
#     assert response.json == {
#         **EMPTY_APPLICATION,
#         **DEFAULT_APPLICATION,
#         'organization_long_name': 'MI',
#         'id': 1,
#     }
