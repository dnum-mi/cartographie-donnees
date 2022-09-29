from typing import List

import pytest

from app import db
from app.models import Family, Organization


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
def sample_families(testing_app) -> List[Family]:
    family1 = Family.from_dict({
        'full_path': 'Matériels > Armes à feu',
    })
    family2 = Family.from_dict({
        'full_path': 'Matériels > Véhicules',
    })
    db.session.add(family1)
    db.session.add(family2)
    db.session.commit()
    db.session.refresh(family1)
    db.session.refresh(family2)
    yield [family1, family2]
