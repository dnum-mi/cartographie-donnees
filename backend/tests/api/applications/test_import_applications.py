from elasticmock import elasticmock

from tests.constants import SUCCESS_RESPONSE_JSON


def import_application_csv(client, admin_auth_header, filename):
    with open(f"tests/files/applications/{filename}", 'rb') as f:
        data = dict(
            file=(f, "Applications.csv"),
        )
        return client.post(
            '/api/applications/import',
            content_type='multipart/form-data',
            data=data,
            headers=admin_auth_header
        )


def test_import_applications_without_organizations(client, admin_auth_header):
    response = import_application_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 400


def test_import_applications_without_administrators(client, admin_auth_header, sample_organizations):
    response = import_application_csv(client, admin_auth_header, 'clean_with_unknown_admin.csv')
    assert response.status_code == 400


def test_import_applications_forbidden(client, user_auth_header, sample_organizations):
    response = import_application_csv(client, user_auth_header, 'clean.csv')
    assert response.status_code == 403

def test_import_applications(client, admin_auth_header, sample_organizations):
    response = import_application_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 200
    assert response.json == SUCCESS_RESPONSE_JSON
    application_count_response = client.get("/api/applications/count", headers=admin_auth_header)
    assert int(application_count_response.data.decode('utf-8')) == 2




# @elasticmock
# def test_import_applications_without_administrators(client, admin_auth_header, admin_user, sample_organizations):
#     response = import_application_csv(client, admin_auth_header, 'clean.csv')
#     assert response.status_code == 200
#     application_count_response = client.get("/api/applications/count", headers=admin_auth_header)
#     assert int(application_count_response.data.decode('utf-8')) == 2
