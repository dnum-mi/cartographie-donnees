from app.search.query_builder import create_exclusion


def test_exclusion_query():
    query = create_exclusion('mots à exclure', ['name', 'description'])
    assert query == {
        'multi_match': {
            'query': 'mots à exclure',
            'fields': ['name', 'description'],
            'fuzziness': 'AUTO'
        }
    }


def test_exclusion_query_no_exclusion():
    query = create_exclusion('', ['name', 'description'])
    assert query is None

