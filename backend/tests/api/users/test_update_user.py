from tests.constants import DEFAULT_USER_INFO


def test_update_user(client, admin_auth_header, simple_user):
    new_first_name = 'New first name'
    response = client.put(f"/api/users/{simple_user.id}", headers=admin_auth_header,
                          json={**DEFAULT_USER_INFO, 'first_name': new_first_name})
    assert response.status_code == 200
    assert 'id' in response.json
    assert response.json['id'] == simple_user.id
    assert response.json['first_name'] == new_first_name


def test_update_user_bad_request(client, admin_auth_header, simple_user):
    response = client.put(f"/api/users/{simple_user.id}", headers=admin_auth_header,
                          json={**DEFAULT_USER_INFO, 'email': 'test.fr'})
    assert response.status_code == 400
    assert response.json['description'] == "L'adresse email est incorrecte"
