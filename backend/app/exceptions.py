
class CSVFormatError(Exception):
    def __init__(self, errors):
        self.message = CSVFormatError.get_message(errors)

    @staticmethod
    def get_message(errors):
        message = "Des erreurs ont été détéctées :\n"
        for error in errors:
            message += "\n- Ligne {row} : {error}".format(**error)
        return message
