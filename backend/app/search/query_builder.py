import copy
import json

from flask import current_app


def create_filter_value_query(field, value):
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


def create_filter_query(filter_key, values, filter_type):
    bool_condition = 'must' if filter_type == 'multiple' else 'should'
    result = {
        'bool': {
            bool_condition: []
        }
    }
    if len(values) == 1:
        return create_filter_value_query(filter_key, values[0])
    for v in values:
        result['bool'][bool_condition].append(
            create_filter_value_query(filter_key, v)
        )
    if bool_condition == 'should':
        result["bool"]["minimum_should_match"] = 1
    return result


def create_exclusion(exclusions, searchable_fields):
    if len(exclusions) > 0:
        return {
            'multi_match': {
                'query': exclusions,
                'fields': searchable_fields,
                'fuzziness': 'AUTO'
            }
        }
    else:
        return None

def create_filters_query(filters_dict):
    from ..models import get_enumeration_type_by_name
    result = {
        'bool': {
            'must': []
        }
    }
    if len(filters_dict.keys()) == 1:
        filter_key = list(filters_dict.keys())[0]
        if filter_key == 'application':
            enum_type = 'simple'
        else:
            enum_type = get_enumeration_type_by_name(filter_key)
        return create_filter_query(filter_key, filters_dict[filter_key], enum_type)
    for field, field_values in filters_dict.items():
        if len(field_values) > 0:
            if field == 'application':
                enum_type = 'simple'
            else:
                enum_type = get_enumeration_type_by_name(field)
            result['bool']['must'].append(create_filter_query(field, field_values, enum_type))
    return result


def create_text_query(query, searchable_fields, strictness):
    if strictness == 'ALL_WORDS':
        return {
            'multi_match': {
                'query': query,
                "type": "cross_fields",
                'operator': 'and',
                'fields': searchable_fields,
            },
        }
    else:
        return {
            'multi_match': {
                'query': query,
                'fields': searchable_fields,
                'fuzziness': 'AUTO'
            },
        }


def create_query_filter(query, filters_dict, strictness, exclusions, searchable_fields):
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
        filters,
):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return {}, 0

    body = create_query_filter(query, filters_dict, strictness, exclusions, searchable_fields)
    body["aggs"] = {
        filter_name: {
            'terms': {
                'field': filter_name + ".keyword",
                "size": 500,  # Max number of distinct filter values
            }
        }
        for filter_name in filters
    }
    # Do not retrieve all the resutls, just the aggregated counts
    body["size"] = 0
    body["track_total_hits"] = True
    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )
    return {
       filter_name: {
           bucket['key']: bucket['doc_count']
           for bucket in search['aggregations'][filter_name]['buckets']
       }
       for filter_name in filters
   }, search['hits']['total']
