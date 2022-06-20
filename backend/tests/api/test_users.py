from tests.constants import ADMIN_CREDENTIALS


def test_read_me(client, admin_auth_header, admin_user):
    response = client.get("/api/users/me", json=ADMIN_CREDENTIALS, headers=admin_auth_header)
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == admin_user.id
