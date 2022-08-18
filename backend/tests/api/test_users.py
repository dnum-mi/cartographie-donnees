import pytest


DEFAULT_USER_INFO = {
    'first_name': 'Jane',
    'last_name': 'Doe',
    'email': 'jane@doe.com',
}

DEFAULT_USER = {
    **DEFAULT_USER_INFO,
    'password': 'strong_password',
    'confirm_password': 'strong_password'
}

"""
Create user
"""


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


"""
Fetch users
"""


def test_fetch_users_success(client, admin_user, admin_auth_header):
    response = client.get("/api/users", headers=admin_auth_header)
    assert response.status_code == 200
    assert type(response.json) == list
    assert len(response.json) == 1
    assert response.json[0]['id'] == admin_user.id


"""
Search users
"""


def test_search_users_success(client, admin_user, admin_auth_header):
    response = client.get("/api/users/search", headers=admin_auth_header)
    assert response.status_code == 200
    assert 'results' in response.json
    assert type(response.json['results']) == list
    assert len(response.json['results']) == 1
    assert response.json['results'][0]['id'] == admin_user.id


"""
Count users
"""


def test_count_users_permission_denied(client, user_auth_header):
    response = client.get("/api/users/count", headers=user_auth_header)
    assert response.status_code == 403


def test_count_users_success(client, admin_auth_header):
    response = client.get("/api/users/count", headers=admin_auth_header)
    assert response.status_code == 200
    assert response.data.decode('utf-8') == '1'


"""
Read me
"""


def test_read_me_unauthenticated(client):
    response = client.get("/api/users/me")
    assert response.status_code == 404


def test_read_me_success(client, admin_auth_header, admin_user):
    response = client.get("/api/users/me", headers=admin_auth_header)
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == admin_user.id


"""
Read user
"""


def test_read_user(client, admin_auth_header, admin_user):
    response = client.get(f"/api/users/{admin_user.id}", headers=admin_auth_header)
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == admin_user.id
