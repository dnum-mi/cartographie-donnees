import unidecode


def remove_accent(string):
    if isinstance(string, str):
        string = unidecode.unidecode(string.lower())
        return string
    elif isinstance(string, list):
        return [remove_accent(s) for s in string]
    else:
        return string
