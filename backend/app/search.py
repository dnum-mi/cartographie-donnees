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

def add_to_index(index, model):
    if not current_app.elasticsearch:
        return
    payload = {}
    for field in model.__searchable__:
        payload[field] = remove_accent(getattr(model, field))
    current_app.elasticsearch.index(index=index, id=model.id, body=payload)


def remove_all_from_index(index):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return
    if current_app.elasticsearch.indices.exists(index=index):
        current_app.elasticsearch.delete_by_query(index=index, body={"query": {"match_all": {}}})

def remove_from_index(index, model):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return
    current_app.elasticsearch.delete(index=index, id=model.id)


def query_index(index, query, searchable_fields, page, per_page):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return [], 0
    query = '*' + query + '*'
    app.logger.info('Searching with query : ' + query +
                    ' (page ' + str(page) + ', ' + str(per_page) + ' items per page)')
    search = current_app.elasticsearch.search(
        index=index,
        body={
            'query': {
                'query_string': {
                    'query': remove_accent(query),
                    'fields': searchable_fields,
                },
            },
            "sort": [{"name.keyword": {"order": "asc"}}, "_score"],
            'from': (page - 1) * per_page, 'size': per_page
        }
    )
    ids = [int(hit['_id']) for hit in search['hits']['hits']]
    app.logger.info('Number of results : ' + str(len(ids)))
    return ids, search['hits']['total']['value']


def create_query_filter(index, query, fields, values, searchable_fields):
    query = '*' + query + '*'
    app.logger.info('Searching with query : ' + query)
    body = {
        'query': {
            'bool': {
                "must": [{
                    'query_string': {
                        'query': remove_accent(query),
                        'fields': searchable_fields,
                    },
                }],
            },
        }
    }
    if fields:
        for field, value in zip(fields, values):
            if isinstance(value, list):
                for v in value:
                    body["query"]["bool"]["must"].append(
                        {
                            'terms': {
                                field + ".keyword": remove_accent([v])
                            }
                        }
                    )
            else:
                body["query"]["bool"]["must"].append(
                    {
                        'term': {
                            field+".keyword": remove_accent(value)
                        }
                    }
                )
    return body

def query_index_with_filter(index, query, fields, values, searchable_fields, page, per_page):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return [], 0, 0

    body = create_query_filter(index, query, fields, values, searchable_fields)

    total_count = current_app.elasticsearch.count(index=index, body=body)["count"]

    body['from'] = (page - 1) * per_page
    body['size'] = per_page
    body['sort'] = [{"name.keyword": {"order": "asc"}}, "_score"]

    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )
    ids = [int(hit['_id']) for hit in search['hits']['hits']]
    app.logger.info('Number of results : ' + str(len(ids)))
    return ids, search['hits']['total']['value'], total_count

def query_count(index, query, fields, values, searchable_fields, field):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return [], 0, 0

    body = create_query_filter(index, query, fields, values, searchable_fields)
    body["aggs"] = {
        'fields':{
            'terms':{
                'field': field+".keyword",
                "size":500
            }
        }
    }
    search = current_app.elasticsearch.search(
        index=index,
        body=body
    )
    field_es_count = search["aggregations"]["fields"]['buckets']
    field_count = []
    for dic in field_es_count:
        field_count.append(
            {
                "value": dic["key"],
                "count": dic["doc_count"]
            }
        )
    return field_count
