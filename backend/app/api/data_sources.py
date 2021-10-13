import os
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from flask_login import login_required, current_user
from io import TextIOWrapper
from sqlalchemy import func
from app import app, db
from app.models import DataSource, Application, Type, Family, Organization, Exposition, Sensibility, OpenData, UpdateFrequency, Origin, Tag
from app.decorators import admin_required, admin_or_owner_required, admin_or_any_owner_required
from app.api.enumerations import get_type_by_name, get_family_by_name, get_classification_by_name, \
    get_exposition_by_name, get_referentiel_by_name, get_sensibily_by_name, get_open_data_by_name, \
    get_update_frequency_by_name, get_origin_by_name, get_tag_by_name
from app.api.applications import get_application_by_name
from app.api.commons import import_resource, export_resource
from app.constants import field_french_to_english_dic
from app.exceptions import CSVFormatError

from app.search import remove_accent


@app.route('/api/data-sources', methods=['GET'])
@login_required
@admin_or_any_owner_required
def fetch_data_sources():
    page = int(request.args.get('page', 1, type=int))
    count = int(request.args.get('count', 10, type=int))
    base_query = DataSource.query
    if not current_user.is_admin:
        base_query = base_query.filter(DataSource.owners.any(id=current_user.id))
    datasources = base_query.all()
    total_count = base_query.count()
    _list = [(data_source.id, remove_accent(data_source.name)) for data_source in datasources]
    _list.sort(key=lambda tup: tup[1])
    datasources = [DataSource.query.filter_by(id=id).one() for id, _ in _list][(page - 1) * count:page * count]
    return jsonify(dict(
        total_count=total_count,
        results=[datasource.to_dict() for datasource in datasources]
    ))

def get_reutilizations(reutilizations):
    if reutilizations:
        return [get_application_by_name(json.get("name"), return_id=False) for json in reutilizations]
    else:
        return []

@app.route('/api/data-sources', methods=['POST'])
@login_required
@admin_or_any_owner_required
def create_data_source():
    try:
        json = request.get_json()
        json["application_id"] = get_application_by_name(json.get("application").get("name"))
        json["origin_application_id"] = get_application_by_name(json.get("origin_application").get("name")) if json.get("origin_application") else None
        json["type_id"] = get_type_by_name(json.get("type_name"))
        json["families"] = get_family_by_name(json.get("family_name"))
        json["classifications"] = get_classification_by_name(json.get("classification_name"))
        json["expositions"] = get_exposition_by_name(json.get("exposition_name"))
        json["referentiel_id"] = get_referentiel_by_name(json.get("referentiel_name"))
        json["sensibility_id"] = get_sensibily_by_name(json.get("sensibility_name"))
        json["open_data_id"] = get_open_data_by_name(json.get("open_data_name"))
        json["update_frequency_id"] = get_update_frequency_by_name(json.get("update_frequency_name"))
        json["origin_id"] = get_origin_by_name(json.get("origin_name"))
        json["reutilizations"] = get_reutilizations(json.get("reutilizations"))
        json["tags"] = get_tag_by_name(json.get("tag_name"))
        data_source = DataSource.from_dict(json)
        db.session.add(data_source)
        db.session.commit()
        DataSource.add_to_index(data_source)
        return jsonify(data_source.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@app.route('/api/data-sources/export_search', methods=['GET'])
def export_data_source_request():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    data_sources, total, total_count = get_data_sources(query, 1, 10000, fields, values)
    return export_resource(DataSource, "data_sources_request.csv", data_sources)

@app.route('/api/data-sources/export/<application_id>', methods=['GET'])
@login_required
@admin_or_owner_required
def export_data_source_of_application(application_id):
    application = Application.query.get(application_id)
    data_sources, total, total_count = get_data_sources("", 1, 10000, ["application_name"], [application.name])
    return export_resource(DataSource, "data_sources_of_%s.csv" % (application.name), data_sources)

@app.route('/api/data-sources/export', methods=['GET'])
@login_required
@admin_required
def export_data_sources():
    return export_resource(DataSource, "data_sources.csv")


@app.route('/api/data-sources/import_by_application/<application_id>', methods=['POST', 'PUT'])
@login_required
@admin_or_owner_required
def import_data_sources_by_application(application_id):
    application_id = int(application_id)
    application = Application.query.get(application_id)
    mandatory_fields = {"application_name": application.name}
    data_sources = db.session.query(DataSource).filter_by(application_id=application_id).all()
    try:
        import_resource(DataSource, data_sources, **mandatory_fields)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@app.route('/api/data-sources/import', methods=['POST'])
@login_required
@admin_required
def import_data_sources():
    try:
        import_resource(DataSource)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@app.route('/api/data-sources/reindex')
def reindex_data_sources():
    DataSource.reindex()
    return jsonify(dict(description='OK', code=200))


def get_data_source(data_source_id):
    try:
        ds_id = int(data_source_id)
    except ValueError:
        raise BadRequest(f"Donnée inconnue : {data_source_id}")
    return DataSource.query.get_or_404(ds_id)


def convert_dict(dic):
    new_dict = {}
    for key, value in dic.items():
        if not value:
            new_dict[key] = None
        else:
            new_dict[key] = value
    return new_dict

def get_fields_values(family=None, type=None, organization=None, application=None, referentiel=None,
                     sensibility=None, open_data=None, exposition=None, origin=None, classification=None, tag=None):
    fields = []
    values = []
    if family:
        fields.append("family_name")
        _list = []
        for element in family:
            _list.append(element)
        values.append(_list)
    if type:
        fields.append("type_name")
        values.append(type)
    if organization:
        fields.append("organization_name")
        values.append(organization)
    if application:
        fields.append("application_name")
        values.append(application)
    if referentiel:
        fields.append("referentiel_name")
        values.append(referentiel)
    if sensibility:
        fields.append("sensibility_name")
        values.append(sensibility)
    if open_data:
        fields.append("open_data_name")
        values.append(open_data)
    if exposition:
        fields.append("exposition_name")
        _list = []
        for element in exposition:
            _list.append(element)
        values.append(_list)
    if origin:
        fields.append("origin_name")
        values.append(origin)
    if classification:
        fields.append("classification_name")
        _list = []
        for element in classification:
            _list.append(element)
        values.append(_list)
    if tag:
        fields.append("tag_name")
        _list = []
        for element in tag:
            _list.append(element)
        values.append(_list)
    return fields, values

def get_data_sources(query, page, count, fields, values):
    return DataSource.search_with_filter(query, fields, values, page, count)

def get_request_args_data_source(request):
    query = request.args.get('q', '', type=str)
    family = request.args.get('family', '', type=str)
    family = [] if not family else family.split(";")
    type = request.args.get('type', '', type=str)
    organization = request.args.get('organization', '', type=str)
    application = request.args.get('application', '', type=str)
    referentiel = request.args.get('referentiel', '', type=str)
    sensibility = request.args.get('sensibility', '', type=str)
    open_data = request.args.get('open_data', '', type=str)
    exposition = request.args.get('exposition', '', type=str)
    exposition = [] if not exposition else exposition.split(";")
    origin = request.args.get('origin', '', type=str)
    classification = request.args.get('classification', '', type=str)
    classification = [] if not classification else classification.split(";")
    tag = request.args.get('tag', '', type=str)
    tag = [] if not tag else tag.split(";")
    return query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag


@app.route('/api/data-sources/search', methods=['GET'])
def search_data_sources():
    page = request.args.get('page', 1, type=int)
    count = request.args.get('count', 10, type=int)
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    data_sources, total, total_count = get_data_sources(query, page, count, fields, values)
    return jsonify(dict(
        total_count=total_count,
        results=[data_source.to_dict() for data_source in data_sources]
    ))

@login_required
@admin_or_owner_required
@app.route('/api/data-sources/count', methods=['GET'])
def count_data_sources():
    base_query = DataSource.query
    if not current_user.is_admin:
        base_query = base_query.filter(DataSource.owners.any(id=current_user.id))
    return str(base_query.count())

@app.route('/api/data-sources/families', methods=['GET'])
def fetch_data_source_families():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'family_name')
    dic = []
    for family in Family.query.all():
        unaccent = remove_accent(family.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": family.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)


@app.route('/api/data-sources/types', methods=['GET'])
def fetch_data_source_types():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'type_name')
    dic = []
    for type in Type.query.all():
        unaccent = remove_accent(type.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": type.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/applications', methods=['GET'])
def fetch_data_source_applications():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'application_name')
    dic = []
    for application in Application.query.all():
        unaccent = remove_accent(application.name)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": application.name, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/organizations', methods=['GET'])
def fetch_data_source_organizations():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values,  'organization_name')
    dic = []
    for organization in Organization.query.all():
        unaccent = remove_accent(organization.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": organization.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/referentiels', methods=['GET'])
def fetch_data_source_referentiels():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'referentiel_name')
    dic = []
    for referentiel in Family.query.all():
        unaccent = remove_accent(referentiel.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": referentiel.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/sensibilities', methods=['GET'])
def fetch_data_source_sensibilities():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'sensibility_name')
    dic = []
    for sensibility in Sensibility.query.all():
        unaccent = remove_accent(sensibility.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": sensibility.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/open-data', methods=['GET'])
def fetch_data_source_open_data():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'open_data_name')
    dic = []
    for open_data in OpenData.query.all():
        unaccent = remove_accent(open_data.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": open_data.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/expositions', methods=['GET'])
def fetch_data_source_expositions():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'exposition_name')
    dic = []
    for exposition in Exposition.query.all():
        unaccent = remove_accent(exposition.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": exposition.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/origins', methods=['GET'])
def fetch_data_source_origins():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'origin_name')
    dic = []
    for origin in Origin.query.all():
        unaccent = remove_accent(origin.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": origin.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/classifications', methods=['GET'])
def fetch_data_source_classifications():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'classification_name')
    dic = []
    for referentiel in Family.query.all():
        unaccent = remove_accent(referentiel.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": referentiel.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)

@app.route('/api/data-sources/tags', methods=['GET'])
def fetch_data_source_tags():
    query, family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag = get_request_args_data_source(request)
    fields, values = get_fields_values(family, type, organization, application, referentiel, sensibility, open_data, exposition, origin, classification, tag)
    field_count = DataSource.query_count(query, fields, values, 'tag_name')
    dic = []
    for tag in Tag.query.all():
        unaccent = remove_accent(tag.value)
        count = 0
        for d in field_count:
            if d["value"] == unaccent:
                count = d["count"]
        dic.append({"value": tag.value, "count": count})
    dic.sort(key=lambda d: d["count"], reverse=True)
    return jsonify(dic)


@app.route('/api/data-sources/<data_source_id>', methods=['GET'])
def read_data_source(data_source_id):
    data_source = get_data_source(data_source_id)
    return jsonify(data_source.to_dict())


@app.route('/api/data-sources/<data_source_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_data_source(data_source_id):
    try:
        data_source = get_data_source(data_source_id)
        json = request.get_json()
        json["application_id"] = get_application_by_name(json.get("application").get("name"))
        json["origin_application_id"] = get_application_by_name(json.get("origin_application").get("name")) if json.get("origin_application") else None
        json["families"] = get_family_by_name(json.get("family_name"))
        json["classifications"] = get_classification_by_name(json.get("classification_name"))
        json["reutilizations"] = get_reutilizations(json.get("reutilizations"))
        json["tags"] = get_tag_by_name(json.get("tag_name"))
        json["type_id"] = get_type_by_name(json.get("type_name"))
        json["expositions"] = get_exposition_by_name(json.get("exposition_name"))
        json["referentiel_id"] = get_referentiel_by_name(json.get("referentiel_name"))
        json["sensibility_id"] = get_sensibily_by_name(json.get("sensibility_name"))
        json["open_data_id"] = get_open_data_by_name(json.get("open_data_name"))
        json["update_frequency_id"] = get_update_frequency_by_name(json.get("update_frequency_name"))
        json["origin_id"] = get_origin_by_name(json.get("origin_name"))
        data_source.update_from_dict(json)
        db.session.commit()
        DataSource.add_to_index(data_source)
        db.session.refresh(data_source)
        return jsonify(data_source.to_dict())
    except Exception as e:
        raise BadRequest(str(e))

@app.route('/api/data-sources/<data_source_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_data_source(data_source_id):
    data_source = get_data_source(data_source_id)
    data_source.delete()
    db.session.commit()
    DataSource.remove_from_index(data_source)
    return jsonify(dict(description='OK', code=200))
