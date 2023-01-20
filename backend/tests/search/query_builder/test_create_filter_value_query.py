from typing import List

from pytest_unordered import unordered

from app.models import Organization
from app.search.query_builder import create_filter_value_query


def test_query_creation_works_without_children(sample_organizations: List[Organization]):
    query = create_filter_value_query('organization', 'MI > DGPN')
    assert query == {
        'term': {
            "organization_name.keyword": 'MI > DGPN'
        }
    }


def test_query_creation_works_with_children(sample_organizations: List[Organization]):
    query = create_filter_value_query('organization', 'MI')
    assert query == {
        "bool": {
            "should": unordered([{
                'term': {
                    "organization_name.keyword": 'MI'
                }
            }, {
                'term': {
                    "organization_name.keyword": 'MI > DGPN'
                }
            }, {
                'term': {
                    "organization_name.keyword": 'MI > SG'
                }
            }]),
            "minimum_should_match": 1
        }
    }


def test_query_creation_works_with_applications():
    """Special case for the application filter because it is not a multi-level filter"""
    query = create_filter_value_query('application', 'SMD')
    assert query == {
        'term': {
            "application_name.keyword": 'SMD'
        }
    }
