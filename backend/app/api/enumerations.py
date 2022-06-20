import os
from werkzeug.exceptions import BadRequest
from flask import jsonify, request, send_file
from io import TextIOWrapper, BytesIO
import csv
from flask_login import login_required

from app import db
from app.decorators import admin_required, admin_or_any_owner_required
from app.models import DataSource, Application, Type, Family, Organization, Exposition, Sensibility, OpenData, UpdateFrequency, Origin, Tag
from app.constants import field_english_to_french_dic, field_french_to_english_dic, enumeration_english_to_french, enumeration_french_to_english
from app.search import remove_accent

from . import api


all_category = [Family, Organization, Type, Sensibility, OpenData, Exposition, Origin, UpdateFrequency, Tag]
required = [Type, Family, Organization]


def get_enumeration_model_by_name(name):
    if name.lower() == "type":
        return Type
    elif name.lower() == "family":
        return Family
    elif name.lower() == "organization":
        return Organization
    elif name.lower() == "sensibility":
        return Sensibility
    elif name.lower() == "classification":
        return Family
    elif name.lower() == "exposition":
        return Exposition
    elif name.lower() == "referentiel":
        return Family
    elif name.lower() == "open_data":
        return OpenData
    elif name.lower() == "update_frequency":
        return UpdateFrequency
    elif name.lower() == "origin":
        return Origin
    elif name.lower() == "tag":
        return Tag

@api.route('/api/enumerations/categories', methods=['GET'])
@login_required
@admin_or_any_owner_required
def get_enumeration_categories():
    return jsonify([enumeration_english_to_french[category.__tablename__] for category in all_category])

@api.route('/api/enumerations', methods=['GET'])
@login_required
@admin_or_any_owner_required
def fetch_enumerations():
    category = request.args.get('category')
    if category:
        category = enumeration_french_to_english[category]
        Enumeration = get_enumeration_model_by_name(category)
        enumerations = Enumeration.query.all()
        _list = [(enum.id, remove_accent(enum.value)) for enum in enumerations]
        _list.sort(key=lambda tup: tup[1])
        enumerations = [Enumeration.query.filter_by(id=id).one() for id, _ in _list]
        enumerations = [enumeration.to_dict() for enumeration in enumerations]
    else:
        enumerations = []

        for category in all_category:
            enums = category.query.all()
            _list = [(enum.id, remove_accent(enum.value)) for enum in enums]
            _list.sort(key=lambda tup: tup[1])
            enums = [category.query.filter_by(id=id).one() for id, _ in _list]
            _list = []
            for enum in enums:
                dic = enum.to_dict()
                dic["category"] = enumeration_english_to_french[category.__tablename__]
                _list.append(dic)
            enumerations.append({"category": enumeration_english_to_french[category.__tablename__], "values": _list})
    return jsonify(enumerations)


@api.route('/api/enumerations', methods=['POST'])
@login_required
@admin_required
def create_enumeration():
    try:
        json = request.get_json()
        category = enumeration_french_to_english[json["category"]]
        Enumeration = get_enumeration_model_by_name(category)
        enumeration = Enumeration.from_dict(json)
        db.session.add(enumeration)
        db.session.commit()
        return jsonify(enumeration.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/enumerations/<enumeration_id>', methods=['PUT'])
@login_required
@admin_required
def update_enumeration(enumeration_id):
    try:
        json = request.get_json()
        category = enumeration_french_to_english[json["category"]]
        Enumeration = get_enumeration_model_by_name(category)
        enumeration = get_enumeration(Enumeration, enumeration_id)
        enumeration.update_from_dict(json)
        db.session.commit()
        db.session.refresh(enumeration)
        DataSource.reindex()
        return jsonify(enumeration.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


def get_enumeration(enumeration_category, enumeration_id):
    try:
        ds_id = int(enumeration_id)
    except ValueError:
        raise BadRequest(f"Filtre inconnue : {enumeration_id}")
    return enumeration_category.query.get_or_404(ds_id)


def convert_dict(category, dic):
    new_dict = {}
    for key, value in dic.items():
        if not value:
            new_dict[key] = None
        else:
            new_dict[key] = value
    return new_dict


@api.route('/api/enumerations/export', methods=['GET'])
@login_required
@admin_required
def export_enumerations():
    enumerations = []
    for category in all_category:
        enums = category.query.all()
        for enum in enums:
            dic = enum.to_export()
            dic["category"] = enumeration_english_to_french[category.__tablename__]
            enumerations.append(dic)
    enumeration_json_list = [{field_english_to_french_dic[key]: value for key, value in dic.items()} for dic in enumerations]
    path = 'app/enumerations.csv'
    headers = enumeration_json_list[0].keys()
    with open(path, 'w', encoding='cp1252', newline='') as output_file:
        fc = csv.DictWriter(output_file,
                            fieldnames=headers,
                            delimiter=';',
                            )
        fc.writeheader()
        fc.writerows(enumeration_json_list)
    return_data = BytesIO()
    with open(path, 'rb') as file:
        return_data.write(file.read())
    return_data.seek(0)
    os.remove(path)
    try:
        return send_file(return_data, mimetype="application/csv", as_attachment=True, attachment_filename="enumerations.csv",
                         cache_timeout=0)

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/enumerations/import', methods=['POST'])
@login_required
@admin_required
def import_enumerations():
    try:
        file = request.files["file"]
        file.stream.seek(0)  # seek to the beginning of file

        enumeration_list = []
        csv_file = TextIOWrapper(file, encoding='cp1252')
        csv_reader = csv.reader(csv_file, delimiter=';')
        headers = next(csv_reader)
        headers = [field_french_to_english_dic[field] for field in headers]
        n = len(headers)
        for row in csv_reader:
            dic = {headers[i]: row[i] for i in range(n)}
            Enumeration = get_enumeration_model_by_name(enumeration_french_to_english[dic["category"]])
            enumeration = Enumeration.from_dict(dic)
            enumeration_list.append(enumeration)

        for category in all_category:
            db.session.query(category).delete(synchronize_session='fetch')
        db.session.bulk_save_objects(enumeration_list)
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))
    else:
        db.session.commit()
        return "ok"


@api.route('/api/enumerations/batch/<enumeration_category>', methods=['DELETE'])
@login_required
@admin_required
def batch_delete_enumerations(enumeration_category):
    Enumeration = get_enumeration_model_by_name(enumeration_category)
    enumerations = Enumeration.query.all()
    [db.session.delete(enumeration) for enumeration in enumerations]
    db.session.commit()
    return jsonify(dict(description='OK', code=200))


@api.route('/api/enumerations/<category>/<enumeration_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_enumeration(category, enumeration_id):
    source = None
    model_name = ""
    if category == "Famille":
        rows = db.session.execute(f"SELECT data_source_id FROM association_family WHERE family_id={enumeration_id}")
        for row in rows:
            source_id = row["data_source_id"]
            source = db.session.query(DataSource).filter(DataSource.id == source_id).first()
            break
        model_name = "Donnée"
    elif category == "Organisation":
        source = db.session.query(Application).filter(Application.organization_id == enumeration_id).first()
        model_name = "Application"
    elif category == "Type":
        source = db.session.query(DataSource).filter(DataSource.type_id == enumeration_id).first()
        model_name = "Donnée"

    if source:
        raise BadRequest(f"Impossible de supprimer cette valeur, vérifier que toutes ses occurences dans les "
                         f"données et applications ont disparues.\nLa valeur est toujours présente dans la ligne "
                         f"\'{source.name}\' du modèle \'{model_name}\'")
    else:
        if category == "Famille":
            db.session.execute(f"DELETE FROM association_family WHERE family_id={enumeration_id}")
            db.session.execute(f"DELETE FROM association_classification WHERE family_id={enumeration_id}")
        if category == "Exposition":
            db.session.execute(f"DELETE FROM association_exposition WHERE exposition_id={enumeration_id}")
        if category == "Tag":
            db.session.execute(f"DELETE FROM association_exposition WHERE tag_id={enumeration_id}")
        category = enumeration_french_to_english[category]
        Enumeration = get_enumeration_model_by_name(category)
        enumeration = get_enumeration(Enumeration, enumeration_id)
        db.session.delete(enumeration)
        db.session.commit()
        return jsonify(dict(description='OK', code=200))


def get_enumeration_by_name(category, name, line=None, nullable=True, return_id=True):
    if nullable and not name:
        return None
    values = category.query.filter_by(value=name).all()
    if values:
        value = values[0]
        id = value.id
        if return_id:
            return id
        else:
            return value
    else:
        if line is not None:
            raise AssertionError("Ligne %s :Le filtre '%s' du modèle %s n'existe pas." % (line, category.__tablename__, name))
        else:
            raise AssertionError("Le filtre '%s' du modèle %s n'existe pas." % (category.__tablename__, name))


def get_type_by_name(name, line=None):
    return get_enumeration_by_name(Type, name, line=line, nullable=False)


def get_family_by_name(names, line=None):
    _list = []
    if names:
        for name in names:
            value = get_enumeration_by_name(Family, name, line=line, return_id=False)
            if value:
                _list.append(value)
    return _list


def get_organization_by_name(name, line=None):
    return get_enumeration_by_name(Organization, name, line=line, nullable=False)


def get_classification_by_name(names, line=None):
    _list = []
    if names:
        for name in names:
            value = get_enumeration_by_name(Family, name, line=line, return_id=False)
            if value:
                _list.append(value)
    return _list

def get_tag_by_name(names, line=None):
    _list = []
    if names:
        for name in names:
            value = get_enumeration_by_name(Tag, name, line=line, return_id=False)
            if value:
                _list.append(value)
    return _list

def get_exposition_by_name(names, line=None):
    _list = []
    if names:
        for name in names:
            value = get_enumeration_by_name(Exposition, name, line=line, return_id=False)
            if value:
                _list.append(value)
    return _list


def get_referentiel_by_name(name, line=None):
    return get_enumeration_by_name(Family, name, line=line)


def get_sensibily_by_name(name, line=None):
    return get_enumeration_by_name(Sensibility, name, line=line)


def get_open_data_by_name(name, line=None):
    return get_enumeration_by_name(OpenData, name, line=line)


def get_update_frequency_by_name(name, line=None):
    return get_enumeration_by_name(UpdateFrequency, name, line=line)


def get_origin_by_name(name, line=None):
    return get_enumeration_by_name(Origin, name, line=line)
