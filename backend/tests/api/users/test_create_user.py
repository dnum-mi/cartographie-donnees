import pytest

from tests.constants import DEFAULT_USER, DEFAULT_USER_INFO


def test_create_user_unauthorized(client):
    response = client.post("/api/users", json=DEFAULT_USER)
    assert response.status_code == 401


def test_create_user_permission_denied(client, user_auth_header):
    response = client.post("/api/users", headers=user_auth_header, json=DEFAULT_USER)
    assert response.status_code == 403


@pytest.mark.parametrize("attribute_key", DEFAULT_USER.keys())
def test_create_user_missing_attribute(client, admin_auth_header, attribute_key):
    json = DEFAULT_USER.copy()
    del json[attribute_key]
    response = client.post("/api/users", headers=admin_auth_header, json=json)
    assert response.status_code == 400


def test_create_user_wrong_password(client, admin_auth_header):
    json = DEFAULT_USER.copy()
    json['confirm_password'] = 'another_password'
    response = client.post("/api/users", headers=admin_auth_header, json=json)
    assert response.status_code == 400


@pytest.mark.parametrize("attribute_key", DEFAULT_USER_INFO.keys())
def test_create_user_success(client, admin_auth_header, attribute_key):
    response = client.post("/api/users", headers=admin_auth_header, json=DEFAULT_USER)
    assert response.status_code == 200
    assert 'id' in response.json
    assert attribute_key in response.json
    assert response.json[attribute_key] == DEFAULT_USER_INFO[attribute_key]
