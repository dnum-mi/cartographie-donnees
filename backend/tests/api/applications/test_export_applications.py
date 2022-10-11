import os


# def test_export_applications(client, admin_auth_header, sample_applications):
#     response = client.get('/api/applications/export', headers=admin_auth_header)
#     assert response.status_code == 200
#     csv_data = response.data.decode('utf-8-sig')
#     csv_lines = csv_data.split(os.linesep)
#     assert len(csv_lines) == 2 + len(sample_applications)  # Empty line at the bottom
#     assert csv_lines[0] == "Nom;Nom long;Organisation;Finalités;Accès;Nb opérateurs;" \
#                            "Nb utilisateurs;Nb connexion par mois;Commentaire sur le nb " \
#                            "d'opérateurs;Commentaire sur le nb utilisateurs;Commentaire " \
#                            "sur le nb connexion par mois;Contact;Date de validation;Historique;" \
#                            "Nombre de données;Nombre de référentiels utilisés;Nombre de réutilisations;" \
#                            "Niveau de description de l'application;Administrateurs"
