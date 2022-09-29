from typing import List

from pytest_unordered import unordered

from app.models import Organization
from app.search.query_builder import create_filter_query


def test_create_filter_query_without_children(sample_organizations: List[Organization]):
    query = create_filter_query('organization', ['MI > DGPN', 'INSEE > SG'])
    assert query == {
        "bool": {
            "should": unordered([{
                'term': {
                    "organization_name.keyword": 'MI > DGPN'
                }
            }, {
                'term': {
                    "organization_name.keyword": 'INSEE > SG'
                }
            }]),
            "minimum_should_match": 1
        }
    }


def test_create_filter_query_with_children(sample_organizations: List[Organization]):
    query = create_filter_query('organization', ['MI', 'INSEE'])
    assert query == {
        "bool": {
            "should": unordered([{
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
            }, {
                "bool": {
                    "should": unordered([{
                        'term': {
                            "organization_name.keyword": 'INSEE'
                        }
                    }, {
                        'term': {
                            "organization_name.keyword": 'INSEE > DG'
                        }
                    }, {
                        'term': {
                            "organization_name.keyword": 'INSEE > SG'
                        }
                    }]),
                    "minimum_should_match": 1
                }
            }]),
            "minimum_should_match": 1
        }
    }
