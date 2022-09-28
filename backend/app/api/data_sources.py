import copy
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import DataSource, Application, Type, Family, Organization, Exposition, Sensibility, OpenData, \
    get_enumeration_model_by_name, Origin, Tag
from app.decorators import admin_required, admin_or_owner_required, admin_or_any_owner_required
from app.api.enumerations import get_type_by_name, get_family_by_name, get_classification_by_name, \
    get_exposition_by_name, get_referentiel_by_name, get_sensibily_by_name, get_open_data_by_name, \
    get_update_frequency_by_name, get_origin_by_name, get_tag_by_name
from app.api.applications import get_application_by_name
from app.api.commons import import_resource, export_resource
from app.exceptions import CSVFormatError

from . import api



@api.route('/api/data-sources', methods=['GET'])
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
    datasources = datasources[(page - 1) * count:page * count]
    datasources = sorted(datasources, key=lambda ds: str.lower(ds.name))
    return jsonify(dict(
        total_count=total_count,
        results=[datasource.to_dict() for datasource in datasources]
    ))


def get_reutilizations(reutilizations):
    if reutilizations:
        return [get_application_by_name(json.get("name"), return_id=False) for json in reutilizations]
    else:
        return []

def get_origin_applications(origin_applications):
    if origin_applications:
        return [get_application_by_name(json.get("name"), return_id=False) for json in origin_applications]
    else:
        return []


@api.route('/api/data-sources', methods=['POST'])
@login_required
@admin_or_any_owner_required
def create_data_source():
    try:
        json = request.get_json()
        json["application_id"] = get_application_by_name(json.get("application").get("name"))
        json["origin_applications"] = get_origin_applications(json.get("origin_applications"))
        json["type_id"] = get_type_by_name(json.get("type_name"))
        json["families"] = get_family_by_name(json.get("family_name"))
        json["classifications"] = get_classification_by_name(json.get("classification_name"))
        json["expositions"] = get_exposition_by_name(json.get("exposition_name"))
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


@api.route('/api/data-sources/export_search', methods=['GET'])
def export_data_source_request():
    query, request_args, strictness, exclusions = get_request_args_data_source(request)
    data_sources, total_count = DataSource.search_with_filter(query, request_args, strictness,1, 10000, exclusions)
    return export_resource(DataSource, "data_sources_request.csv", data_sources)


@api.route('/api/data-sources/export/<application_id>', methods=['GET'])
@login_required
@admin_or_owner_required
def export_data_source_of_application(application_id):
    application = Application.query.get(application_id)
    return export_resource(DataSource, f"data_sources_of_{application.name}.csv", application.data_sources)


@api.route('/api/data-sources/export', methods=['GET'])
@login_required
@admin_required
def export_data_sources():
    return export_resource(DataSource, "data_sources.csv")


@api.route('/api/data-sources/import_by_application/<application_id>', methods=['POST', 'PUT'])
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


@api.route('/api/data-sources/import', methods=['POST'])
@login_required
@admin_required
def import_data_sources():
    try:
        import_resource(DataSource)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@api.route('/api/data-sources/reindex')
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


def get_fields_values(request_args):
    filtered_dict = {
        k: v
        for k, v in request_args.items()
        if len(v) > 0
    }
    dict_with_children = copy.deepcopy(filtered_dict)
    fields = list(filtered_dict.keys())
    for key in fields:
        cls = get_enumeration_model_by_name(key)
        all_records = cls.query.all()
        for value in filtered_dict[key]:
            instance = [record for record in all_records if record.full_path == value][0]
            children_full_paths = instance.get_children_full_paths_recursively()
            for full_path in children_full_paths:
                dict_with_children[key].append(full_path)
    return [f'{field}_name' for field in fields], list(dict_with_children.values())


def get_request_args_data_source(request):
    filters_list = ['family', 'type', 'organization', 'application', 'referentiel', 'sensibility', 'open_data',
                    'exposition', 'origin', 'classification','tag']

    query = request.args.get('q', '', type=str)
    strictness = request.args.get('strictness', '', type=str)
    exclusions = request.args.get('toExclude', '', type=str)
    to_return = {}
    for filter in filters_list:
        temp = request.args.get(filter, '', type=str)
        temp = [] if not temp else temp.split(";")
        to_return[filter] = temp
    return query, to_return, strictness, exclusions


@api.route('/api/data-sources/search', methods=['GET'])
def search_data_sources():
    page = request.args.get('page', 1, type=int)
    count = request.args.get('count', 10, type=int)
    query, request_args, strictness, exclusions = get_request_args_data_source(request)
    data_sources, total_count = DataSource.search_with_filter(
        query, request_args, strictness, page, count, exclusions)
    return jsonify(dict(
        total_count=total_count,
        results=[data_source.to_dict() for data_source in data_sources]
    ))


@api.route('/api/data-sources/count_by_enumeration', methods=['GET'])
def count_data_sources_by_enumeration():
    query, request_args, strictness, exclusions = get_request_args_data_source(request)
    count_dict, total_count = DataSource.query_count(query, request_args, strictness, exclusions)
    return jsonify(dict(
        total_count=total_count,
        results=count_dict,
    ))


@api.route('/api/data-sources/count', methods=['GET'])
@login_required
@admin_or_any_owner_required
def count_data_sources():
    base_query = DataSource.query
    if not current_user.is_admin:
        base_query = base_query.filter(DataSource.owners.any(id=current_user.id))
    return str(base_query.count())


@api.route('/api/data-sources/families', methods=['GET'])
def fetch_data_source_families():
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/types', methods=['GET'])
def fetch_data_source_types():
    return jsonify(Type.get_tree_dict())


@api.route('/api/data-sources/applications', methods=['GET'])
def fetch_data_source_applications():
    return jsonify([
        {
            'id': application.id,
            'value': application.name,
            'full_path': application.name,
            'children': [],
        }
        for application in Application.query.all()
    ])


@api.route('/api/data-sources/organizations', methods=['GET'])
def fetch_data_source_organizations():
    return jsonify(Organization.get_tree_dict())


@api.route('/api/data-sources/referentiels', methods=['GET'])
def fetch_data_source_referentiels():
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/sensibilities', methods=['GET'])
def fetch_data_source_sensibilities():
    return jsonify(Sensibility.get_tree_dict())


@api.route('/api/data-sources/open-data', methods=['GET'])
def fetch_data_source_open_data():
    return jsonify(OpenData.get_tree_dict())


@api.route('/api/data-sources/expositions', methods=['GET'])
def fetch_data_source_expositions():
    return jsonify(Exposition.get_tree_dict())


@api.route('/api/data-sources/origins', methods=['GET'])
def fetch_data_source_origins():
    return jsonify(Origin.get_tree_dict())


@api.route('/api/data-sources/classifications', methods=['GET'])
def fetch_data_source_classifications():
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/tags', methods=['GET'])
def fetch_data_source_tags():
    return jsonify(Tag.get_tree_dict())


@api.route('/api/data-sources/<data_source_id>', methods=['GET'])
def read_data_source(data_source_id):
    data_source = get_data_source(data_source_id)
    return jsonify(data_source.to_dict())


@api.route('/api/data-sources/<data_source_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_data_source(data_source_id):
    try:
        data_source = get_data_source(data_source_id)
        json = request.get_json()
        json["application_id"] = get_application_by_name(json.get("application").get("name"))
        json["origin_applications"] = get_origin_applications(json.get("origin_applications"))
        json["families"] = get_family_by_name(json.get("family_name"))
        json["classifications"] = get_classification_by_name(json.get("classification_name"))
        json["reutilizations"] = get_reutilizations(json.get("reutilizations"))
        json["tags"] = get_tag_by_name(json.get("tag_name"))
        json["type_id"] = get_type_by_name(json.get("type_name"))
        json["expositions"] = get_exposition_by_name(json.get("exposition_name"))
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


@api.route('/api/data-sources/<data_source_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_data_source(data_source_id):
    data_source = get_data_source(data_source_id)
    data_source.delete()
    db.session.commit()
    DataSource.remove_from_index(data_source)
    return jsonify(dict(description='OK', code=200))
