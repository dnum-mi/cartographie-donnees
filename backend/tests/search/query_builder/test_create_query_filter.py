from typing import List

from pytest_unordered import unordered

from app.models import Organization
from app.search.enums import Strictness
from app.search.query_builder import create_query_filter


def test_query_with_filters_and_text(sample_organizations: List[Organization]):
    query = create_query_filter(
        'test',
        {'organization': ['MI > DGPN', 'INSEE > SG']},
        Strictness.ALL_WORDS,
        'mots à exclure',
        ['name', 'description'],
    )
    assert query == {
        'query': {
            'bool': {
                "must": [{
                    'multi_match': {
                        'query': 'test',
                        "type": "cross_fields",
                        'operator': 'and',
                        'fields': ['name', 'description'],
                    },
                }, {
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
                }],
                "must_not": {
                    'multi_match': {
                        'query': 'mots à exclure',
                        'fields': ['name', 'description'],
                        'fuzziness': 'AUTO'
                    }
                }
            }
        },
    }


def test_query_only_with_text(sample_organizations: List[Organization]):
    query = create_query_filter(
        'test',
        {},
        Strictness.ALL_WORDS,
        'mots à exclure',
        ['name', 'description'],
    )
    assert query == {
        'query': {
            'bool': {
                "must": [{
                    'multi_match': {
                        'query': 'test',
                        "type": "cross_fields",
                        'operator': 'and',
                        'fields': ['name', 'description'],
                    },
                }],
                "must_not": {
                    'multi_match': {
                        'query': 'mots à exclure',
                        'fields': ['name', 'description'],
                        'fuzziness': 'AUTO'
                    }
                }
            }
        }
    }


def test_query_only_with_filters(sample_organizations: List[Organization]):
    query = create_query_filter(
        '',
        {'organization': ['MI > DGPN', 'INSEE > SG']},
        Strictness.ALL_WORDS,
        'mots à exclure',
        ['name', 'description'],
    )
    assert query == {
        'query': {
            'bool': {
                "must": [{
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
                }],
                "must_not": {
                    'multi_match': {
                        'query': 'mots à exclure',
                        'fields': ['name', 'description'],
                        'fuzziness': 'AUTO'
                    }
                }
            }
        },
    }


def test_blank_query():
    query = create_query_filter(
        '',
        {},
        Strictness.ALL_WORDS,
        'mots à exclure',
        ['name', 'description'],
    )
    assert query == {
        'query': {
            'match_all': {},
        },
    }
