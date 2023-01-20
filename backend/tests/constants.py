ADMIN_CREDENTIALS = {
    'email': 'admin@default.com',
    'password': 'default_password',
}
ADMIN_INFO = {
    **ADMIN_CREDENTIALS,
    'first_name': 'Admin',
    'last_name': 'Admin',
}
USER_CREDENTIALS = {
    'email': 'user@default.com',
    'password': 'default_password',
}
USER_INFO = {
    **USER_CREDENTIALS,
    'first_name': 'User',
    'last_name': 'User',
}

DEFAULT_USER_INFO = {
    'first_name': 'Jane',
    'last_name': 'Doe',
    'email': 'jane@doe.com',
}

DEFAULT_USER = {
    **DEFAULT_USER_INFO,
    'password': 'strong_password',
    'confirm_password': 'strong_password'
}

DEFAULT_APPLICATION = {
    'name': 'Application test',
    'goals': 'Application fictive utilisée pour les tests',
    'organization_name': 'MI',
}
EMPTY_APPLICATION = {
    'access_url': None,
    'context_email': None,
    'goals': None,
    'historic': None,
    'id': None,
    'long_name': None,
    'monthly_connection_count': None,
    'monthly_connection_count_comment': None,
    'name': 'Application test',
    'operator_count': None,
    'operator_count_comment': None,
    'organization_long_name': None,
    'organization_name': None,
    'owners': [],
    'user_count': None,
    'user_count_comment': None,
    'validation_date': None
}

SUCCESS_RESPONSE_JSON = {
    'code': 200,
    'description': 'OK'
}

SAMPLE_APPLICATION = {
    'name': 'App 1',
    'goals': "Finalité de l'app 1",
    'organization_id': 'MI > DGPN'
}

DEFAULT_DATA_SOURCE = {
    "name": "New data source",
    "family_name": [
        "family1"
    ],
    "type_name": "type1",
    "application": SAMPLE_APPLICATION
}
