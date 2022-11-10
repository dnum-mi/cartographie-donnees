from elasticmock import elasticmock

import os

def test_create_data_source_unauthorized(client):
    response = client.get("/api/data-sources/export")
    assert response.status_code == 401


def test_create_data_source_forbidden(client, user_auth_header):
    response = client.get("/api/data-sources/export", headers=user_auth_header)
    assert response.status_code == 403


def test_create_data_source_admin(client, admin_auth_header, sample_data_sources):
    response = client.get("/api/data-sources/export", headers=admin_auth_header)
    assert response.status_code == 200
    csv_data = response.data.decode('utf-8-sig')
    csv_lines = csv_data.split(os.linesep)
    assert len(csv_lines) == 2 + len(sample_data_sources)  # Empty line at the bottom
    assert csv_lines[0] == "Nom;Description;Application;Réutilisation;Famille;Tag;Type;Exemple;Sensibilité;OpenData" \
                           ";Base/index;Table;Nb tables;Champ;Nb champs;Volumétrie;Commentaire sur la " \
                           "volumétrie;Production par mois;Commentaire sur la  production par mois;Mise à " \
                           "jour;Conservation;Axes d'analyse;Exposition;Origine;Application source;Donnée " \
                           "référentielle"

