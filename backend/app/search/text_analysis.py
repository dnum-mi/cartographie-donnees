from flask import current_app
from app.models.WildCard import WildCard

def set_default_analyzer(index):
    if current_app.elasticsearch:
        if not current_app.elasticsearch.indices.exists(index=index):
            current_app.elasticsearch.indices.create(index=index, body={"number_of_shards": 1})
        current_app.elasticsearch.indices.close(index=index)
        current_app.elasticsearch.indices.put_settings(
            get_french_analyzer_payload(),
            index=index,
        )
        current_app.elasticsearch.indices.open(index=index)


def get_synonyms():
    query = WildCard.query.filter_by(namespace='synonyme', key='synonyme').first()
    synonyms_raw = query.value
    return synonyms_raw.splitlines()


def get_french_analyzer_payload():
    synonyms = get_synonyms()
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
                "synonym": {
                    "type": "synonym",
                    "lenient": "true",
                    "synonyms": synonyms,
                }
            },
            "analyzer": {
                "default": {
                    "tokenizer":  "standard",
                    "filter": [
                        "french_elision",
                        "lowercase",
                        "asciifolding",
                        "synonym",
                        "french_stop",
                    ]
                }
            }
        }
    }
