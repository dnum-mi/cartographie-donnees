
from tests.constants import SUCCESS_RESPONSE_JSON


def import_data_source_csv(client, admin_auth_header, filename):
    with open(f"tests/files/data_sources/{filename}", 'rb') as f:
        data = dict(
            file=(f, "Donnees.csv"),
        )
        return client.post(
            '/api/data-sources/import',
            content_type='multipart/form-data',
            data=data,
            headers=admin_auth_header
        )


def test_import_data_source_without_type(client, admin_auth_header, sample_family, sample_applications):
    response = import_data_source_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 400


def test_import_data_source_without_family(client, admin_auth_header, sample_type, sample_applications):
    response = import_data_source_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 400


def test_import_data_source_without_application(client, admin_auth_header, sample_type, sample_family):
    response = import_data_source_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 400


def test_import_data_source_with_unknown_application(client, admin_auth_header, sample_type, sample_family):
    response = import_data_source_csv(client, admin_auth_header, 'clean_with_unknown_application.csv')
    assert response.status_code == 400


def test_import_data_source_with_unknown_family(client, admin_auth_header, sample_type, sample_family):
    response = import_data_source_csv(client, admin_auth_header, 'clean_with_unknown_family.csv')
    assert response.status_code == 400


def test_import_data_source_with_unknown_type(client, admin_auth_header, sample_type, sample_family):
    response = import_data_source_csv(client, admin_auth_header, 'clean_with_unknown_type.csv')
    assert response.status_code == 400


def test_import_data_sources_forbidden(client, user_auth_header, sample_type, sample_family, sample_applications):
    response = import_data_source_csv(client, user_auth_header, 'clean.csv')
    assert response.status_code == 403


def test_import_applications(client, admin_auth_header, sample_type, sample_family, sample_applications):
    response = import_data_source_csv(client, admin_auth_header, 'clean.csv')
    assert response.status_code == 200
    assert response.json == SUCCESS_RESPONSE_JSON
    data_sources_count_response = client.get("/api/data-sources/count", headers=admin_auth_header)
    assert int(data_sources_count_response.data.decode('utf-8')) == 2
