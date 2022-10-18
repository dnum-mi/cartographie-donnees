from datetime import datetime

from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from flask_login import login_required, current_user

from app.models import Application, DataSource
from app.decorators import admin_required, admin_or_owner_required
from app.api.enumerations import get_organization_by_name
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource

from . import api
from .. import db
from ..search.enums import Strictness


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


@api.route('/api/applications', methods=['GET'])
@login_required
def fetch_applications():
    """Obtenir des applications
    ---
    get:
        tags:
            - Applications
        summary: Obtenir des applications
        description: Endpoint retournant une liste paginée d'applications. L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les applications appartenant à l'utilisateur.

        parameters:
            - name: page
              in: query
              description: La page d'applications voulue
              required: false
              schema:
                type: integer
                default: 1

            - name: count
              in: query
              description: Le nombre d'applications par page
              required: false
              schema:
                type: integer
                default: 10

        responses:
            '200':
              description: Une liste paginée d'applications
              content:
                application/json::
                    schema:
                        $ref: "#/components/schemas/ApplicationWithDataSourcesGet"
    """
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


@api.route('/api/applications', methods=['POST'])
@login_required
@admin_required
def create_application():
    """Créer une nouvelle application
    ---
    post:
      tags:
        - Applications
      summary: Créer une nouvelle application
      requestBody:
          description: Un objet JSON contenant les données de la nouvelle application
          required: true
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApplicationPost"
      responses:
        200:
          description: L'objet application qui vient d'être créé
          content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/ApplicationGet"
    """
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


@api.route('/api/applications/reindex')
def reindex_applications():
    """Réindexer les applications
    ---
    get:
      tags:
        - Applications
      summary: Réindexer les applications
      description: Synchronisation de l'index elasticsearch correspondant aux applications avec la base de données.
      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/JsonResponse200"
    """
    Application.reindex()
    return jsonify(dict(description='OK', code=200))


def get_application(application_id):
    try:
        app_id = int(application_id)
    except ValueError:
        raise BadRequest(f"Application inconnue : {application_id}")
    return Application.query.get_or_404(app_id)


@api.route('/api/applications/export', methods=['GET'])
@login_required
@admin_required
def export_applications():
    """Exporter les applications
    ---
    get:
      tags:
        - Applications
      summary: Exporter les applications
      description: Export en CSV de toutes les applications
      responses:
        200:
          description: Les applications en format CSV
          content:
                application/csv:
                    schema:
                        $ref: "#/components/schemas/ApplicationCSV"
    """
    return export_resource(Application, "applications.csv")


@api.route('/api/applications/import', methods=['POST'])
@login_required
@admin_required
def import_applications():
    """Importer les applications
    ---
    post:
      tags:
        - Applications
      summary: Importer les applications
      description: Importer et remplacer toutes les applications à partir d'un CSV
      requestBody:
          description: Le CSV contenant les applications
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/ApplicationCSV"
      responses:
        200:
          content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"
    """
    try:
        warning = import_resource(Application)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    if warning:
        return jsonify({'code':200, **warning})
    return jsonify(dict(description='OK', code=200))


@api.route('/api/applications/search_limited', methods=['GET'])
@login_required
def search_applications_limited():
    """Obtenir des applications avec recherche limitée
    ---
    get:
        tags:
            - Applications
        summary: Obtenir des applications avec recherche limitée
        description: Endpoint retournant une liste paginée d'applications basée sur une recherche. L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les applications appartenant à l'utilisateur.

        parameters:
            - name: page
              in: query
              description: La page d'applications voulue
              required: false
              schema:
                type: integer
                default: 1

            - name: count
              in: query
              description: Le nombre d'applications par page
              required: false
              schema:
                type: integer
                default: 1000

            - name: q
              in: query
              description: Le string de la recherche
              required: false
              schema:
                type: string
                default: ''

            - name: organization
              in: query
              description: Filtre par organization
              required: false
              schema:
                type: string

        responses:
            '200':
              description: Une liste paginée d'applications
              content:
                application/json::
                    schema:
                        type: object
                        properties:
                            results:
                                type: array
                                description: Résultats de la recherche
                                items:
                                    $ref: "#/components/schemas/ApplicationGet"
                            total_count:
                                type: integer
                                description: Nombre totale de résultats
    """
    page = int(request.args.get('page', 1))
    count = int(request.args.get('count', 1000))
    query = request.args.get('q', '', type=str)
    organization = request.args.get('organization', '', type=str)
    request_args = {}
    if organization:
        request_args["organization"] = [organization]
    applications, total_count = Application.search_with_filter(query, request_args, Strictness.ANY_WORDS, page, count)
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


@api.route('/api/applications/search', methods=['GET'])
@login_required
def search_applications():
    """Obtenir des applications avec recherche
    ---
    get:
        tags:
            - Applications
        summary: Obtenir des applications avec recherche
        description: Endpoint retournant une liste paginée d'applications basée sur une recherche.

        parameters:
            - name: page
              in: query
              description: La page d'applications voulue
              required: false
              schema:
                type: integer
                default: 1

            - name: count
              in: query
              description: Le nombre d'applications par page
              required: false
              schema:
                type: integer
                default: 1000

            - name: q
              in: query
              description: Le string de la recherche
              required: false
              schema:
                type: string
                default: ''

            - name: organization
              in: query
              description: Filtre par organization
              required: false
              schema:
                type: string

        responses:
            '200':
              description: Une liste paginée d'applications
              content:
                application/json:
                    schema:
                        type: object
                        properties:
                            results:
                                type: array
                                description: Résultats de la recherche
                                items:
                                    $ref: "#/components/schemas/ApplicationGet"
                            total_count:
                                type: integer
                                description: Nombre total de résultats
    """
    page = int(request.args.get('page', 1))
    count = int(request.args.get('count', 1000))
    query = request.args.get('q', '', type=str)
    organization = request.args.get('organization', '', type=str)
    request_args = {}
    if organization:
        request_args["organization"] = [organization]
    applications, total_count = Application.search_with_filter(query, request_args, Strictness.ANY_WORDS, page, count)
    return jsonify(dict(
        total_count=total_count,
        results=[application.to_dict() for application in applications]
    ))


@api.route('/api/applications/count', methods=['GET'])
@login_required
def count_applications():
    """Nombre d'applications
    ---
    get:
      tags:
        - Applications
      summary: Nombre d'applications
      description: Recevoir le nombre total d'applications existantes. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les applications appartenant à l'utilisateur.

      responses:
        200:
          content:
            text/plain:
                schema:
                    type: integer
    """
    base_query = Application.query
    if not current_user.is_admin:
        base_query = base_query.filter(Application.owners.any(id=current_user.id))
    return str(base_query.count())


@api.route('/api/applications/organizations', methods=['GET'])
def fetch_application_organizations():
    """Organisation des applications
    ---
    get:
      tags:
        - Applications
      summary: Organisation des applications
      description: Liste des organisations (MOA) reliées aux applications correspondant à la recherche.
      parameters:
            - name: page
              in: query
              required: false
              schema:
                type: integer
                default: 1

            - name: q
              in: query
              description: Le string de la recherche
              required: false
              schema:
                type: string
                default: ''

      responses:
        200:
          content:
            application/json:
                schema:
                    type: array
                    items:
                        type: object
                        description: Organisation
                        properties:
                            value:
                                type: string
                                example: MI > DSR > SDPUR
                            count:
                                type: integer
                                example: 6

    """
    page = request.args.get('page', 1, type=int)
    query = request.args.get('q', '', type=str)
    applications, _ = Application.search_with_filter(query, {}, "ANY_WORDS", page, 500)
    organizations = [application.organization_name for application in applications]
    organization_dict = {}
    for organization in organizations:
        if organization in organization_dict:
            organization_dict[organization] += 1
        else:
            organization_dict[organization] = 1
    organizations = [{"value": organization, "count": count} for organization, count in organization_dict.items()]
    return jsonify(organizations)


@api.route('/api/applications/<application_id>', methods=['GET'])
def read_application(application_id):
    """Obtenir une application
    ---
    get:
        tags:
            - Applications
        summary: Obtenir une application
        description: Endpoint retournant une application par son ID.

        parameters:
            - name: application_id
              in: path
              required: true
              schema:
                type: integer

        responses:
            '200':
              description: L'application correspondante incluant toutes les données associées à cette application.
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/ApplicationWithDataSourcesGet"

    """
    application = get_application(application_id)
    return jsonify(application.to_dict(populate_data_sources=True))


@api.route('/api/applications/<application_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_application(application_id):
    """Mettre à jour une application
    ---
    put:
        tags:
            - Applications
        summary: Mettre à jour une application
        description: L'authentification est requise. L'utilisateur doit être propriétaire d'application.
        parameters:
            - name: application_id
              in: path
              required: true
              schema:
                type: integer
        requestBody:
          description: Le JSON de l'application mis à jour
          required: true
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApplicationGet"

        responses:
            '200':
              description: L'application mis à jour.
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/ApplicationGet"
    """
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


@api.route('/api/applications/<application_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_application(application_id):
    """Supprimer une application
    ---
    delete:
        tags:
            - Applications
        summary: Supprimer une application
        description: L'authentification est requise. L'utilisateur doit être propriétaire d'application.
        parameters:
            - name: application_id
              in: path
              required: true
              schema:
                type: integer

        responses:
            '200':
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"
            '400':
                description: Vérifier que l'application n'héberge aucune donnée avant la suppression.
    """
    application = get_application(application_id)
    source = db.session.query(DataSource).filter(DataSource.application_id == application_id).first()
    if not source:
        db.session.delete(application)
        db.session.commit()
        Application.remove_from_index(application)
        return jsonify(dict(description='OK', code=200))
    else:
        raise BadRequest(
            f"Impossible de supprimer cette application, vérifier que celle-ci n'héberge aucunes données avant la suppression.\n"
            f"La donnée \'{source.name}\' semble toujours hébergée par l'application ")
