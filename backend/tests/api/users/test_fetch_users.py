
def test_fetch_users_success(client, admin_user, admin_auth_header):
    response = client.get("/api/users", headers=admin_auth_header)
    assert response.status_code == 200
    assert type(response.json) == list
    assert len(response.json) == 1
    assert response.json[0]['id'] == admin_user.id
