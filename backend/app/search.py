import copy

from flask import current_app
from app import app
import unidecode


def remove_accent(string):
    if isinstance(string, str):
        string = unidecode.unidecode(string.lower())
        return string
    elif isinstance(string, list):
        return [remove_accent(s) for s in string]
    else:
        return string


def set_default_analyzer(index):
    if not current_app.elasticsearch:
        return
    current_app.elasticsearch.indices.close(index=index)
    current_app.elasticsearch.indices.put_settings(
        get_french_analyzer_payload(),
        index=index,
    )
    current_app.elasticsearch.indices.open(index=index)


def create_record_payload(model):
    return {
        field: getattr(model, field)
        for field in model.__searchable__
    }


def add_to_index(index, model):
    if not current_app.elasticsearch:
        return
    payload = create_record_payload(model)
    current_app.elasticsearch.index(index=index, id=model.id, body=payload)


def bulk_add_to_index(index, models):
    if not current_app.elasticsearch:
        return
    body = [
        [
            {
                'index': {
                    '_index': index,
                    '_id': model.id,
                    '_type': '_doc',
                }
            },
            create_record_payload(model),
        ]
        for model in models
    ]
    flattened_body = [x for array in body for x in array]
    if len(flattened_body):
        current_app.elasticsearch.bulk(body=flattened_body)


def get_french_analyzer_payload():
    return {
        "analysis": {
            "filter": {
                "french_elision": {
                    "type":         "elision",
                    "articles_case": True,
                    "articles": [
                        "l", "m", "t", "qu", "n", "s",
                        "j", "d", "c", "jusqu", "quoiqu",
                        "lorsqu", "puisqu"
                    ]
                },
                "french_stop": {
                    "type":       "stop",
                    "stopwords":  "_french_"
                },
                "french_keywords": {
                    "type":       "keyword_marker",
                    "keywords":   []
                },
                "french_stemmer": {
                    "type":       "stemmer",
                    "language":   "light_french"
                }
            },
            "analyzer": {
                "rebuilt_french": {
                    "tokenizer":  "standard",
                    "filter": [
                        "french_elision",
                        "lowercase",
                        "french_stop",
                        "french_keywords",
                        "french_stemmer"
                    ]
                }
            }
        }
    }


def remove_all_from_index(index):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return
    if current_app.elasticsearch.indices.exists(index=index):
        current_app.elasticsearch.delete_by_query(index=index, body={"query": {"match_all": {}}})


def remove_from_index(index, model):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return
    current_app.elasticsearch.delete(index=index, id=model.id)


def create_filter_value_query(field, value):
    from .models import get_enumeration_model_by_name
    cls = get_enumeration_model_by_name(field)
    instance = cls.find_by_full_path(value)
    enum_instances_to_search = instance.get_children_recursively()
    if len(enum_instances_to_search) == 0:
        return {
            'term': {
                field + "_name.keyword": instance.full_path
            }
        }
    enum_instances_to_search.append(instance)
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


def add_filters_query(body, filters_dict):
    from .models import get_enumeration_type_by_name
    result = copy.deepcopy(body)
    for field, field_values in filters_dict.items():
        if len(field_values) > 0:
            enum_type = get_enumeration_type_by_name(field)
            bool_condition = 'must' if enum_type == 'multiple' else 'should'
            if (
                'query' not in result or
                'bool' not in result['query'] or
                bool_condition not in result['query']['bool']
            ):
                result["query"]["bool"][bool_condition] = []
            for v in field_values:
                result["query"]["bool"][bool_condition].append(
                    create_filter_value_query(field, v)
                )
            if bool_condition == 'should':
                result["query"]["bool"]["minimum_should_match"] = 1
    return result


def create_query_filter(query, filters_dict, searchable_fields):
    query = '*' + query + '*'
    app.logger.info('Searching with query : ' + query)
    body = {
        'query': {
            'bool': {
                "must": [{
                    'query_string': {
                        'query': query,
                        'fields': searchable_fields,
                    },
                }],
            },
        }
    }
    if filters_dict:
        body = add_filters_query(body, filters_dict)
    return body


def query_index_with_filter(
    index,
    query,
    filters_dict,
    searchable_fields,
    page,
    per_page,
):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return [], 0

    body = create_query_filter(query, filters_dict, searchable_fields)

    body['from'] = (page - 1) * per_page
    body['size'] = per_page
    body['sort'] = ["_score", {"name.keyword": {"order": "asc"}}]

    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )
    ids = [int(hit['_id']) for hit in search['hits']['hits']]
    app.logger.info('Number of results : ' + str(len(ids)))
    return ids, search['hits']['total']


def query_count(
    index,
    query,
    filters_dict,
    searchable_fields,
    filters,
):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return {}, 0

    body = create_query_filter(query, filters_dict, searchable_fields)
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
