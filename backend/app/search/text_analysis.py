from flask import current_app


def set_default_analyzer(index):
    if not current_app.elasticsearch:
        return
    current_app.elasticsearch.indices.close(index=index)
    current_app.elasticsearch.indices.put_settings(
        get_french_analyzer_payload(),
        index=index,
    )
    current_app.elasticsearch.indices.open(index=index)


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
                "default": {
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
