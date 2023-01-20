def test_delete_user_not_found(client, admin_auth_header):
    response = client.delete(f"/api/users/999", headers=admin_auth_header)
    assert response.status_code == 404


def test_delete_user(client, admin_auth_header, simple_user):
    response = client.delete(f"/api/users/{simple_user.id}", headers=admin_auth_header)
    assert response.status_code == 200
    response = client.get(f"/api/users/{simple_user.id}", headers=admin_auth_header)
    assert response.status_code == 404
