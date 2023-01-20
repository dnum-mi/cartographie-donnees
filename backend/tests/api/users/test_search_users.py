def test_search_users_success(client, admin_user, admin_auth_header):
    response = client.get("/api/users/search", headers=admin_auth_header)
    assert response.status_code == 200
    assert 'results' in response.json
    assert type(response.json['results']) == list
    assert len(response.json['results']) == 1
    assert response.json['results'][0]['id'] == admin_user.id
