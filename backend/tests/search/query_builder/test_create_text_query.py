from app.search.enums import Strictness
from app.search.query_builder import create_text_query


def test_create_text_query_all_words():
    query = create_text_query('test', ['name', 'description'], Strictness.ALL_WORDS)
    assert query == {
        'multi_match': {
            'query': 'test',
            'operator': 'and',
            'fields': ['name', 'description'],
        },
    }


def test_create_text_query_any_words():
    query = create_text_query('test', ['name', 'description'], Strictness.ANY_WORDS)
    assert query == {
        'multi_match': {
            'query': 'test',
            'fields': ['name', 'description'],
        },
    }
