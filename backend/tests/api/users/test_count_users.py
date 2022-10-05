def test_count_users_permission_denied(client, user_auth_header):
    response = client.get("/api/users/count", headers=user_auth_header)
    assert response.status_code == 403


def test_count_users_success(client, admin_auth_header):
    response = client.get("/api/users/count", headers=admin_auth_header)
    assert response.status_code == 200
    assert response.data.decode('utf-8') == '1'
