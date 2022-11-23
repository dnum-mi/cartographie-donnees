from flask import request, send_file
from datetime import datetime
from io import TextIOWrapper, BytesIO
import csv
import os
from sqlalchemy.exc import StatementError
from difflib import SequenceMatcher
from url_normalize import url_normalize

from app import db
from app.models import SearchableMixin
from app.constants import field_french_to_english_dic, field_english_to_french_dic, ORDERED_KEY_BY_APPEARANCE
from app.exceptions import CSVFormatError
from app.models import Application, DataSource, WildCard


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
            db.session.delete(item)

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

    duplicates = {}
    applications_dict = {}
    applications_list = []

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
                    raise ValueError("Ligne %s : Le champ %s de valeur %s est incorrect (la valeur attendue est %s)" % (
                        i, key, item_dict[key], value))

            if "access_url" in item_dict:
                item_dict["access_url"] = url_normalize(item_dict["access_url"])
            # Each row is converted into SQLAlchemy model instances
            item = resource_class(**item_dict)
            # Check for duplicate rows
            if resource_class is DataSource:
                check_for_datasource_duplicates(item_dict, item, row_index, applications_dict, duplicates)
            elif resource_class is Application:
                check_for_application_duplicates(item_dict, item, row_index, applications_list, duplicates)
            db.session.add(item)
        except (ValueError, AssertionError) as e:
            errors.append(dict(row=row_index + 2, error=e))

    if errors:
        db.session.rollback()
        raise CSVFormatError(errors)
    else:
        try:
            db.session.commit()
            if issubclass(resource_class, SearchableMixin):
                resource_class.reindex()
            if duplicates:
                # Must wait until objects are committed in db before obtaining their IDs
                set_duplicate_items_ids(duplicates, resource_class)
                return generate_duplicate_warning_string_msg(duplicates)
        except StatementError as e:
            db.session.rollback()
            raise CSVFormatError([dict(row='inconnue', error=e)])
        # TODO: test it



def check_for_datasource_duplicates(item_dict, item, row_index, applications_dict, duplicates):
    app_name = item_dict['application_name']
    data_source_obj = {
        'data_source_name': item_dict['name'],
        'line': row_index + 2,
        'object': item
    }
    if app_name in applications_dict:
        # we check all already imported data sources that have the same application is their names are similar
        for data_source in applications_dict[app_name]:
            match_ratio = SequenceMatcher(None, data_source['data_source_name'], item_dict['name']).ratio()
            if match_ratio > 0.95:
                if data_source['data_source_name'] in duplicates:
                    duplicates[data_source['data_source_name']].append(
                        create_duplicate_item(data_source_obj['line'], data_source_obj['object'])
                    )
                    break
                else:
                    duplicates[data_source['data_source_name']] = [
                        create_duplicate_item(data_source['line'], data_source['object']),
                        create_duplicate_item(data_source_obj['line'], data_source_obj['object'])
                    ]
        applications_dict[app_name].append(data_source_obj)
    else:
        applications_dict[app_name] = [data_source_obj]


def check_for_application_duplicates(item_dict, item, row_index, applications_list, duplicates):
    application_obj = {
        'name': item_dict['name'],
        'long_name': item_dict['long_name'],
        'line': row_index + 2,
        'item_object': item
    }
    for application in applications_list:
        name_match_ratio = SequenceMatcher(None, application['name'], application_obj['name']).ratio()
        long_name_match_ratio = 0 if (application['long_name'] is None or application_obj['long_name'] is None) \
            else SequenceMatcher(None, application['long_name'], application_obj['long_name']).ratio()

        if name_match_ratio > 0.95 or long_name_match_ratio > 0.95:
            if application['name'] in duplicates:
                duplicates[application['name']]['items'].append(
                    create_duplicate_item(application_obj['line'], application_obj['item_object'])
                )
            else:
                duplicates[application['name']] = dict(
                    name=application['name'],
                    long_name=application['long_name'],
                    items=[
                        create_duplicate_item(application['line'], application['item_object']),
                        create_duplicate_item(application_obj['line'], application_obj['item_object']),
                    ]
                )
    applications_list.append(application_obj)


def create_duplicate_item(line, obj):
    return dict(
        line=line,
        object=obj
    )


def set_duplicate_items_ids(duplicates, resource_class):
    for duplicate in duplicates:
        items = []
        if resource_class is DataSource:
            items = duplicates[duplicate]
        elif resource_class is Application:
            items = duplicates[duplicate]['items']

        for item in items:
            item['id'] = item['object'].id
            del item['object']


def generate_duplicate_warning_string_msg(duplicates):
    return dict(
        message="Doublons repérés dans l'import",
        description=dict(
            header="Les lignes suivantes ont été indiquées comme en doublon dans l'import. \n Ils ont tout de même été importés, si ce n'était pas intentionnel merci de les supprimer "
                   "manuellement et de réimporter le fichier:",
            list=duplicates
        ),
        warning_type="duplicates"
    )


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

    if resource_class is WildCard:
        items_list = sort_wildcards_by_appearance(items_list)

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


def sort_wildcards_by_appearance(items_list):
    ordered_list = [{}]*len(ORDERED_KEY_BY_APPEARANCE)
    for element in items_list:
        key = element["Clé"]
        try:
            idx = ORDERED_KEY_BY_APPEARANCE.index(key)
            ordered_list[idx] = element
        except ValueError:
            ordered_list.append(element)
    return ordered_list


