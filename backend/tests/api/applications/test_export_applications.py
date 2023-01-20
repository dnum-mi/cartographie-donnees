import os


def test_export_applications(client, admin_auth_header, sample_applications, sample_organizations):
    response = client.get('/api/applications/export', headers=admin_auth_header)
    assert response.status_code == 200
    csv_data = response.data.decode('utf-8-sig')
    csv_lines = csv_data.split('\r\n')
    assert len(csv_lines) == 2 + len(sample_applications)  # Empty line at the bottom
    assert csv_lines[0] == "Nom;Nom long;Finalités;Site;Organisation;Contact;Nb opérateurs;" \
                           "Commentaire sur le nb d'opérateurs;Nb utilisateurs;Commentaire sur le nb utilisateurs;" \
                           "Nb connexion par mois;Commentaire sur le nb connexion par mois;Historique;" \
                           "Date de validation;Nombre de données;Nombre de référentiels utilisés;" \
                           "Nombre de réutilisations;Niveau de description de l'application;Administrateurs"
    assert csv_lines[1] == f"{sample_applications[0].name};;{sample_applications[0].goals};;{next((x.full_path for x in sample_organizations if x.id == sample_applications[0].organization_id), None)};;;;;;;;;;0;0;0;0;"
    assert csv_lines[2] == f"{sample_applications[1].name};;{sample_applications[1].goals};;{next((x.full_path for x in sample_organizations if x.id == sample_applications[1].organization_id), None)};;;;;;;;;;0;0;0;0;"


def test_export_applications_unauthorized(client):
    response = client.get('/api/applications/export')
    assert response.status_code == 401


def test_export_applications_forbidden(client, user_auth_header):
    response = client.get('/api/applications/export')
    assert response.status_code == 403
