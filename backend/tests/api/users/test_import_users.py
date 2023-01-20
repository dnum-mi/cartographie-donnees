def import_user_csv(client, admin_auth_header, filename):
    with open(f"tests/files/users/{filename}", 'rb') as f:
        data = dict(
            file=(f, "Administrateurs.csv"),
        )
        return client.post(
            '/api/users/import',
            content_type='multipart/form-data',
            data=data,
            headers=admin_auth_header
        )


def test_import_users(client, admin_auth_header):
    response = import_user_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 200
    user_count_response = client.get(f"/api/users/count", headers=admin_auth_header)
    assert int(user_count_response.data.decode('utf-8')) == 4


def test_import_users_same_email(client, admin_auth_header):
    response = import_user_csv(client, admin_auth_header, 'same_email.csv')
    assert response.status_code == 400
    assert 'UNIQUE constraint failed' in response.json['description']
    user_count_response = client.get(f"/api/users/count", headers=admin_auth_header)
    assert int(user_count_response.data.decode('utf-8')) == 1


def test_import_users_unknown_column(client, admin_auth_header):
    response = import_user_csv(client, admin_auth_header, 'unknown_column.csv')
    assert response.status_code == 400
    assert "L'en-tête Adresse n'est pas un en-tête accepté" in response.json['description']
    user_count_response = client.get(f"/api/users/count", headers=admin_auth_header)
    assert int(user_count_response.data.decode('utf-8')) == 1
