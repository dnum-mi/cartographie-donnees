import json
from typing import List, Dict

from flask import current_app

from app.search.enums import Strictness
from itertools import accumulate


def create_filter_value_query(field: str, value: str):
    if field == 'application':
        return {
            'term': {
                field + "_name.keyword": value
            }
        }
    from ..models import get_enumeration_model_by_name
    cls = get_enumeration_model_by_name(field)
    instance = cls.find_by_full_path(value)
    enum_instances_to_search = instance.get_children_recursively()
    enum_instances_to_search.append(instance)
    if len(enum_instances_to_search) == 1:
        return {
            'term': {
                field + "_name.keyword": instance.full_path
            }
        }
    result = {
        "bool": {
            "should": [],
            "minimum_should_match": 1
        }
    }
    for enum_instance in enum_instances_to_search:
        result['bool']['should'].append({
            'term': {
                field + "_name.keyword": enum_instance.full_path
            }
        })
    return result


def create_filter_query(filter_key: str, values: List[str]):
    if len(values) == 1:
        return create_filter_value_query(filter_key, values[0])
    result = {
        'bool': {
            'should': [],
            'minimum_should_match': 1
        }
    }
    for v in values:
        result['bool']['should'].append(
            create_filter_value_query(filter_key, v)
        )
    return result


def create_exclusion(exclusions: str, searchable_fields: List[str]):
    if len(exclusions) > 0:
        return {
            'multi_match': {
                'query': exclusions,
                'fields': searchable_fields,
            }
        }
    else:
        return None


def create_filters_query(filters_dict: Dict[str, List[str]]):
    result = {
        'bool': {
            'must': []
        }
    }
    if len(filters_dict.keys()) == 1:
        filter_key = list(filters_dict.keys())[0]
        return create_filter_query(filter_key, filters_dict[filter_key])
    for field, field_values in filters_dict.items():
        if len(field_values) > 0:
            result['bool']['must'].append(create_filter_query(field, field_values))
    return result


def create_text_query(query: str, searchable_fields: List[str], strictness: Strictness):
    return {
        'query_string': {
            'query': f'*{query}*',
            'fields': searchable_fields,
            'default_operator': 'AND' if strictness == Strictness.ALL_WORDS else 'OR'
        },
    }


def create_query_filter(
        query: str,
        filters_dict: Dict[str, List[str]],
        strictness: Strictness,
        exclusions: str,
        searchable_fields: List[str]
):
    slim_filters_dict = {
        k: v for k, v in filters_dict.items() if len(v) > 0
    }
    text_query = None
    filters_query = None
    exclusion = create_exclusion(exclusions, searchable_fields)
    if query:
        text_query = create_text_query(query, searchable_fields, strictness)
    if len(slim_filters_dict.keys()):
        filters_query = create_filters_query(slim_filters_dict)
    if text_query:
        if filters_query:
            return {
                'query': {
                    'bool': {
                        "must": [
                            text_query,
                            filters_query,
                        ],
                        "must_not": exclusion
                    }
                },
            }
        return {
            'query': {
                'bool': {
                    "must": [
                        text_query
                    ],
                    "must_not": exclusion
                }
            }
        }
    if filters_query:
        return {
            'query': {
                'bool': {
                    "must": [
                        filters_query
                    ],
                    "must_not": exclusion
                }
            }
        }
    return {
        'query': {
            'match_all': {},
        },
    }


def query_index_with_filter(
        index,
        query,
        filters_dict,
        strictness,
        exclusions,
        searchable_fields,
        page,
        per_page,
):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return [], 0

    body = create_query_filter(query, filters_dict, strictness, exclusions, searchable_fields)

    body['from'] = (page - 1) * per_page
    body['size'] = per_page
    body['sort'] = ["_score"]
    current_app.logger.info(f"Query: \n{json.dumps(body)}")
    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )
    ids = [int(hit['_id']) for hit in search['hits']['hits']]
    current_app.logger.info(f'Number of results : {search["hits"]["total"]}')
    return ids, search['hits']['total']


def query_count(
        index,
        query,
        filters_dict,
        strictness,
        exclusions,
        searchable_fields,
        enumerations,
):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return {}, 0

    body = create_query_filter(query, filters_dict, strictness, exclusions, searchable_fields)
    body["track_total_hits"] = True
    body["size"] = 10000 #Beware, 10000 is the limit

    current_app.logger.info(f"Query: \n{json.dumps(body)}")
    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )

    current_app.logger.info(f'Number of results : {search["hits"]["total"]}')

    # Count occurences of each enum value
    datasource_gen = [element["_source"] for element in search["hits"]["hits"]]
    count_dict = {enumeration:{} for enumeration in enumerations}
    break_char = " > "

    for datasource in datasource_gen:
        for enumeration in enumerations:
            if isinstance(datasource[enumeration], list):
                if len(datasource[enumeration])>0:
                    # Create a set of unique values that are associated to this datasource for this enum type (multiple values allowed)
                    enum_name_set = set()
                    for raw_enum_name in datasource[enumeration]:
                        splitted = raw_enum_name.split(break_char)
                        # cumulative split list "materiel > voiture" ->["materiel", "materiel > voiture"]
                        cum_split = list(accumulate(splitted, lambda x, y: break_char.join([x, y])))
                        enum_name_set.update(cum_split)
                    # Add 1 to associated values for this enum type
                    for enum_name in enum_name_set:
                        count_dict[enumeration][enum_name]=count_dict[enumeration].get(enum_name,0)+1
            else:
                # Same with single value
                raw_enum_name = datasource[enumeration]
                if raw_enum_name is not None:
                    splitted = raw_enum_name.split(break_char)
                    cum_split = list(accumulate(splitted, lambda x, y: break_char.join([x, y])))
                    for enum_name in cum_split:
                        count_dict[enumeration][enum_name]=count_dict[enumeration].get(enum_name,0)+1

    return count_dict, search['hits']['total']


