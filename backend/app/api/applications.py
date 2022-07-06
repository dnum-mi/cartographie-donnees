from datetime import datetime

from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from flask_login import login_required, current_user
from app import app, db
from app.models import Application, DataSource
from app.decorators import admin_required, admin_or_owner_required, admin_or_any_owner_required
from app.api.enumerations import get_organization_by_name
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource


def get_application_by_name(name, line=None, return_id=True):
    value = Application.query.filter_by(name=name).first()
    if value:
        id = value.id
        if return_id:
            return id
        else:
            return value
    else:
        if line is None:
            raise AssertionError("Ligne %s : L'application '%s' n'existe pas." % (line, name))
        else:
            raise AssertionError("L'application '%s' n'existe pas." % (name))


@app.route('/api/applications', methods=['GET'])
@login_required
@admin_or_any_owner_required
def fetch_applications():
    page = int(request.args.get('page', 1, type=int))
    count = int(request.args.get('count', 10, type=int))
    base_query = Application.query
    if not current_user.is_admin:
        base_query = base_query.filter(Application.owners.any(id=current_user.id))
    applications = base_query.all()
    total_count = base_query.count()
    applications = applications[(page - 1) * count:page * count]
    applications = sorted(applications, key=lambda appli: str.lower(appli.name))
    return jsonify(dict(
        total_count=total_count,
        results=[application.to_dict() for application in applications]
    ))


@app.route('/api/applications', methods=['POST'])
@login_required
@admin_required
def create_application():
    try:
        json = request.get_json()
        if json.get("validation_date"):
            json["validation_date"] = datetime.strptime(json["validation_date"], '%d/%m/%Y').date()
        json["organization_id"] = get_organization_by_name(json["organization_name"])
        application = Application.from_dict(json)
        db.session.add(application)
        db.session.commit()
        Application.add_to_index(application)
        return jsonify(application.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@app.route('/api/applications/reindex')
def reindex_applications():
    Application.reindex()
    return jsonify(dict(description='OK', code=200))


def get_application(application_id):
    try:
        app_id = int(application_id)
    except ValueError:
        raise BadRequest(f"Application inconnue : {application_id}")
    return Application.query.get_or_404(app_id)


def convert_dict(dic):
    new_dict = {}
    for key, value in dic.items():
        if not value:
            new_dict[key] = None
        else:
            new_dict[key] = value
    return new_dict


@app.route('/api/applications/export', methods=['GET'])
@login_required
@admin_required
def export_applications():
    return export_resource(Application, "applications.csv")


@app.route('/api/applications/import', methods=['POST'])
@login_required
@admin_required
def import_applications():
    try:
        import_resource(Application)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@app.route('/api/applications/search_limited', methods=['GET'])
@login_required
@admin_or_any_owner_required
def search_applications_limited():
    page = int(request.args.get('page', 1))
    count = int(request.args.get('count', 1000))
    query = request.args.get('q', '', type=str)
    organization = request.args.get('organization', '', type=str)
    request_args = {}
    if organization:
        request_args["organization"] = [organization]
    applications, total_count = Application.search_with_filter(query, request_args, page, count)
    if not current_user.is_admin:
        application_of_user = []
        for application in applications:
            if current_user in application.owners:
                application_of_user.append(application)
    else:
        application_of_user = applications
    return jsonify(dict(
        total_count=total_count,
        results=[application.to_dict() for application in application_of_user]
    ))


@app.route('/api/applications/search', methods=['GET'])
@login_required
@admin_or_any_owner_required
def search_applications():
    page = int(request.args.get('page', 1))
    count = int(request.args.get('count', 1000))
    query = request.args.get('q', '', type=str)
    organization = request.args.get('organization', '', type=str)
    request_args = {}
    if organization:
        request_args["organization"] = [organization]
    applications, total_count = Application.search_with_filter(query, request_args, page, count)
    return jsonify(dict(
        total_count=total_count,
        results=[application.to_dict() for application in applications]
    ))


@app.route('/api/applications/count', methods=['GET'])
def count_applications():
    base_query = Application.query
    if not current_user.is_admin:
        base_query = base_query.filter(Application.owners.any(id=current_user.id))
    return str(base_query.count())


@app.route('/api/applications/organizations', methods=['GET'])
def fetch_application_organizations():
    page = request.args.get('page', 1, type=int)
    query = request.args.get('q', '', type=str)
    applications, _ = Application.search_with_filter(query, {}, page, 500)
    organizations = [application.organization_name for application in applications]
    organization_dict = {}
    for organization in organizations:
        if organization in organization_dict:
            organization_dict[organization] += 1
        else:
            organization_dict[organization] = 1
    organizations = [{"value": organization, "count": count} for organization, count in organization_dict.items()]
    return jsonify(organizations)


@app.route('/api/applications/<application_id>', methods=['GET'])
def read_application(application_id):
    application = get_application(application_id)
    return jsonify(application.to_dict(populate_data_sources=True))


@app.route('/api/applications/<application_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_application(application_id):
    try:
        application = get_application(application_id)
        json = request.get_json()
        if json.get("validation_date"):
            json["validation_date"] = datetime.strptime(json["validation_date"], '%d/%m/%Y').date()
        json["organization_id"] = get_organization_by_name(json["organization_name"])
        application.update_from_dict(json)
        db.session.commit()
        db.session.refresh(application)
        # Get all datasource of application
        # reindex them
        data_sources = DataSource.query.filter(DataSource.application_id == application.id).all()
        for data_source in data_sources:
            DataSource.add_to_index(data_source)
        Application.add_to_index(application)
        return jsonify(application.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@app.route('/api/applications/<application_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_application(application_id):
    application = get_application(application_id)
    source = db.session.query(DataSource).filter(DataSource.application_id == application_id).first()
    if not source:
        db.session.delete(application)
        db.session.commit()
        Application.remove_from_index(application)
        return jsonify(dict(description='OK', code=200))
    else:
        raise BadRequest(f"Impossible de supprimer cette application, vérifier que celle-ci n'héberge aucunes données avant la suppression.\n"
                          f"La donnée \'{source.name}\' semble toujours hébergée par l'application ")
