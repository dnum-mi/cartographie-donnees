def test_read_me_unauthenticated(client):
    response = client.get("/api/users/me")
    assert response.status_code == 404


def test_read_me_user(client, user_auth_header, simple_user):
    response = client.get("/api/users/me", headers=user_auth_header)
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == simple_user.id


def test_read_me_admin(client, admin_auth_header, admin_user):
    response = client.get("/api/users/me", headers=admin_auth_header)
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == admin_user.id
