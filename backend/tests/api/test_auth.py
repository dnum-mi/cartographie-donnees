from tests.constants import ADMIN_CREDENTIALS


def test_login(client, admin_user):
    response = client.post("/api/login", json=ADMIN_CREDENTIALS)
    assert response.status_code == 200
    assert 'token' in response.json
