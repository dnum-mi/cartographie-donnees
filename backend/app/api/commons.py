from flask import request, send_file
from datetime import datetime
from io import TextIOWrapper, BytesIO
import csv
import os
from sqlalchemy.exc import StatementError

from app import db
from app.models import SearchableMixin
from app.constants import field_french_to_english_dic, field_english_to_french_dic
from app.exceptions import CSVFormatError


def typed_value_from_string(value):
    """Convert a string into a value with a Python type.

    :param value: The string we want to convert.
    :return: The Python value
    """
    # Convert empty strings to None
    if not value:
        return None
    # Convert boolean strings
    if value in ['False', 'Non', "Faux"]:
        return False
    if value in ['True', "Oui", "Vrai"]:
        return True
    # Convert date string to date
    if len(value) == 10 and value[2] == "/" and value[5] == "/":
        try:
            return datetime.strptime(value, '%d/%m/%Y').date()
        except:
            raise ValueError("La valeur %s ne correspond pas au format de date jj/mm/aaaa" % (value))
    # Finally, value is a simple string
    return value


def import_resource(resource_class, item_to_delete=None, **mandatory_fields):
    """Import a list of objects from a CSV file for a given resource.
    This function uses a "delete all and create all" method.
    The entire resource table is wiped out and the CSV file content is then inserted.

    :param resource_class: The resource model class. It should inherits from the BaseModel class.
    :param item_to_delete: The list of objects to delete (Optional, by default delete all items of resource_class)
    :param mandatory_fields: The fields wich must satisfied a value (Optional, by default no fields)
    """

    # First wipe up the database
    if item_to_delete is None:
        resource_class.delete_all()
    else:
        for item in item_to_delete:
            item.delete()

    # Get the CSV file
    file = request.files["file"]
    # Seek to the beginning of file
    file.stream.seek(0)

    # Decode using the signed UTF-8 encoding to read it nicely in Excel
    csv_file = TextIOWrapper(file, encoding='utf_8_sig')
    csv_reader = csv.reader(csv_file, delimiter=';')

    # Headers are in french, they need to be translated
    headers_list = next(csv_reader)
    headers = []
    errors = []
    for field in headers_list:
        try:
            if field in field_french_to_english_dic:
                headers.append(field_french_to_english_dic[field])
            else:
                raise ValueError(f"L'en-tête {field} n'est pas un en-tête accepté")
        except ValueError as e:
            errors.append(dict(row=0, error=e))

    for row_index, row in enumerate(csv_reader):
        # Each row is converted into a dictionary containing the file headers as keys
        item_dict = {}
        try:
            for i, header in enumerate(headers):
                item_dict[header] = typed_value_from_string(row[i])
            # Filter out non-allowed parameters
            item_dict = resource_class.filter_import_dict(item_dict)
            for key, value in mandatory_fields.items():
                if key not in item_dict:
                    raise ValueError("L'en-tête " + key + "est absente. Vérifier les en-têtes du fichiers")
                if item_dict[key] != value:
                    raise ValueError("Ligne %s : Le champ %s de valeur %s est incorrect (la valeur attendue est %s)" % (i, key, item_dict[key], value))
            # Each row is converted into SQLAlchemy model instances
            item = resource_class(**item_dict)
            db.session.add(item)
        except (ValueError, AssertionError) as e:
            errors.append(dict(row=row_index + 2, error=e))
    if errors:
        db.session.rollback()
        raise CSVFormatError(errors)
    else:
        try:
            db.session.commit()
        except StatementError as e:
            raise CSVFormatError([dict(row='inconnue', error=e)])
        # TODO: test it
        if issubclass(resource_class, SearchableMixin):
            resource_class.reindex()


def export_resource(resource_class, filename, items=None):
    """Export every items of a given resource in CSV format.

    :param resource_class: The resource model class. It should inherits from the BaseModel class.
    :param filename: The CSV filename
    :param items: The list of objects to export (Optional, by default query all items of resource_class)
    :return: the CSV file
    """
    # Retrieve all items
    if not items:
        items = resource_class.query.all()
    # Convert to dictionaries
    items_list = [item.to_export() for item in items]
    # Translate the keys in french
    items_list = [{field_english_to_french_dic[key]: value for key, value in dic.items()} for dic in items_list]

    # Write the temporary CSV file in Windows Excel encoding on the given path
    path = 'app/{}'.format(filename)
    if not items_list:
        raise ValueError("There is not data to export")
    headers = items_list[0].keys()
    with open(path, 'w', encoding='utf_8_sig', newline='') as output_file:
        fc = csv.DictWriter(output_file, fieldnames=headers, delimiter=';')
        fc.writeheader()
        fc.writerows(items_list)

    # Write the file in a Byte array to send it
    return_data = BytesIO()
    with open(path, 'rb') as file:
        return_data.write(file.read())
    return_data.seek(0)

    # Remove the temporary file
    os.remove(path)
    # Finally send the file
    return send_file(
        return_data,
        mimetype="application/csv",
        as_attachment=True,
        attachment_filename=filename,
        cache_timeout=0,
    )
