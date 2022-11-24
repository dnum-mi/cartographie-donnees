from flask import current_app


def create_record_payload(model):
    return {
        field: getattr(model, field)
        for field in model.__search_index_fields__
    }


def add_to_index(index, model):
    if not current_app.elasticsearch:
        return
    payload = create_record_payload(model)
    current_app.elasticsearch.index(index=index, id=model.id, body=payload)


def bulk_add_to_index(index, models):
    if current_app.elasticsearch:
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


def remove_all_from_index(index):
    if current_app.elasticsearch and current_app.elasticsearch.indices.exists(index=index):
        current_app.elasticsearch.delete_by_query(index=index, body={"query": {"match_all": {}}})


def remove_from_index(index, model):
    if not current_app.elasticsearch or not current_app.elasticsearch.indices.exists(index=index):
        return
    current_app.elasticsearch.delete(index=index, id=model.id)
