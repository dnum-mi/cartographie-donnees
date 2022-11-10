import os


def test_export_users(client, admin_auth_header, admin_user):
    response = client.get('/api/users/export', headers=admin_auth_header)
    assert response.status_code == 200
    csv_data = response.data.decode('utf-8-sig')
    csv_lines = csv_data.split(os.linesep)
    assert len(csv_lines) == 3  # Empty line at the bottom
    assert csv_lines[0] == 'Prénom;Nom de famille;Email;Administrateur ?;Mot de passe'
    assert ';'.join([
        admin_user.first_name,
        admin_user.last_name,
        admin_user.email,
        'True',
    ]) in csv_lines[1]
