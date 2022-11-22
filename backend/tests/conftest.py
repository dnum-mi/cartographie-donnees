from typing import Dict, List

import pytest

from app.models import User, Organization, Application, Type, Family, DataSource
from app import db, create_app
from tests.constants import ADMIN_INFO, ADMIN_CREDENTIALS, USER_INFO, USER_CREDENTIALS


@pytest.fixture()
def testing_app():
    app = create_app(testing=True)
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://",  # in-memory db
    })
    app_context = app.app_context()
    app_context.push()
    db.create_all()
    yield app
    db.session.remove()
    db.drop_all()
    app_context.pop()


@pytest.fixture()
def client(testing_app):
    return testing_app.test_client()


@pytest.fixture()
def admin_user(testing_app) -> User:
    default_admin = User.from_dict(ADMIN_INFO, create_admin=True)
    default_admin.set_password(ADMIN_INFO['password'])
    default_admin.is_admin = True
    db.session.add(default_admin)
    db.session.commit()
    db.session.refresh(default_admin)
    yield default_admin


@pytest.fixture()
def admin_auth_header(client, admin_user) -> Dict:
    response = client.post("/api/login", json=ADMIN_CREDENTIALS)
    return {'Authorization': f'Bearer {response.json["token"]}'}


@pytest.fixture()
def simple_user(testing_app) -> User:
    default_user = User.from_dict(USER_INFO)
    default_user.set_password(USER_INFO['password'])
    default_user.is_admin = False
    db.session.add(default_user)
    db.session.commit()
    db.session.refresh(default_user)
    yield default_user


@pytest.fixture()
def user_auth_header(client, simple_user) -> Dict:
    response = client.post("/api/login", json=USER_CREDENTIALS)
    return {'Authorization': f'Bearer {response.json["token"]}'}


@pytest.fixture()
def sample_organizations(testing_app) -> List[Organization]:
    org1 = Organization.from_dict({
        'full_path': 'MI > DGPN',
        'label': 'Direction générale de la police nationale',
    })
    org2 = Organization.from_dict({
        'full_path': 'MI > SG',
        'label': 'Direction générale de la police nationale',
    })
    org3 = Organization.from_dict({
        'full_path': 'INSEE > DG',
        'label': 'Direction générale de la police nationale',
    })
    org4 = Organization.from_dict({
        'full_path': 'INSEE > SG',
        'label': 'Direction générale de la police nationale',
    })
    db.session.add(org1)
    db.session.add(org2)
    db.session.add(org3)
    db.session.add(org4)
    db.session.commit()
    db.session.refresh(org1)
    db.session.refresh(org2)
    db.session.refresh(org3)
    db.session.refresh(org4)
    yield [org1, org2, org3, org4]

@pytest.fixture()
def sample_organizations2(testing_app) -> List[Organization]:
    org1 = Organization.from_dict({
        'full_path': 'MI',
        'label': 'Direction générale de la police nationale',
    })
    org2 = Organization.from_dict({
        'full_path': 'MI > SG',
        'label': 'Direction générale de la police nationale',
    })

    db.session.add(org1)
    db.session.add(org2)
    db.session.commit()
    db.session.refresh(org1)
    db.session.refresh(org2)
    yield [org1, org2]


@pytest.fixture()
def sample_applications(testing_app, sample_organizations) -> List[Application]:
    app1 = Application.from_dict({
        'name': 'App 1',
        'goals': "Finalité de l'app 1",
        'organization_id': sample_organizations[0].id
    })
    app2 = Application.from_dict({
        'name': 'App 2',
        'goals': "Finalité de l'app 2",
        'organization_id': sample_organizations[1].id
    })
    db.session.add(app1)
    db.session.add(app2)
    db.session.commit()
    db.session.refresh(app1)
    db.session.refresh(app2)
    yield [app1, app2]

@pytest.fixture()
def sample_type(testing_app) -> Type:
    type = Type.from_dict({
        'full_path': 'type1'
    })
    db.session.add(type)
    db.session.commit()
    db.session.refresh(type)
    yield type

@pytest.fixture()
def sample_family(testing_app) -> Family:
    family = Family.from_dict({
        'full_path': 'family1'
    })
    db.session.add(family)
    db.session.commit()
    db.session.refresh(family)
    yield family

@pytest.fixture()
def sample_data_sources(testing_app, sample_type, sample_family, sample_applications) -> List[DataSource]:
    # add second data source once resolved
    data_source1 = DataSource.from_dict({
        "name": "New data source1",
        "families": [
            sample_family
        ],
        "type_id": sample_type.id,
        "application_id": sample_applications[0].id,
        "origin_applications": [],
        "analysis_axis": [],
        "expositions": [],
        "reutilizations": [],
        "tags": []
    })

    data_source2 = DataSource.from_dict({
        "name": "New data source2",
        "families": [
            sample_family
        ],
        "type_id": sample_type.id,
        "application_id": sample_applications[1].id,
        "origin_applications": [],
        "analysis_axis": [],
        "expositions": [],
        "reutilizations": [],
        "tags": []
    })

    db.session.add(data_source1)
    db.session.add(data_source2)
    db.session.commit()
    db.session.refresh(data_source1)
    db.session.refresh(data_source2)
    yield [data_source1, data_source2]

