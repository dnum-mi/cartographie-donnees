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
    """Obtenir des données
    ---
    get:
        summary: Obtenir des données
        description: Endpoint retournant une liste paginée de données. L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les données donc l'application appartenant à l'utilisateur.
        parameters:
            - pageDataSrc
            - countDataSrc

        responses:
            '200':
              description: Les données correspondante incluant l'application associées à la donnée.
              content:
                application/json:
                    schema:
                        type: object
                        properties:
                            results:
                                type: array
                                items:
                                    $ref: "#/components/schemas/DataSource"
                            total_count:
                                type: integer

    """
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
    """Créer une donnée
    ---
    post:
        summary: Créer une donnée
        description: L'authentification est requise. Si l'utilisateur n'est pas admin mais est propriétaire d'application, il ne peut créer des données que pour des applications dont il est propriétaire.

        requestBody:
          required: true
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DataSource"


        responses:
            '200':
              description: La donnée créé.
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/DataSource"

    """
    try:
        json = request.get_json()
        json["application_id"] = get_application_by_name(json.get("application").get("name"))
        json["origin_applications"] = get_origin_applications(json.get("origin_applications"))
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


@api.route('/api/data-sources/export_search', methods=['GET'])
def export_data_source_request():
    """Exporter les données de recherche
    ---
    get:
        summary: Exporter les données de recherche
        description: Export de toutes les données (limite 10 000) en format CSV.
        parameters:
            - searchQuery
            - family
            - type
            - organization
            - application
            - referentiel
            - sensibility
            - open_data
            - exposition
            - origin
            - tag
            - strictness
            - toExclude

        responses:
            '200':
              description: Donnée exportée.
              content:
                application/csv:
                    schema:
                        $ref: "#/components/schemas/DataSourceCSV"

    """
    query, request_args, strictness, exclusions = get_request_args_data_source(request)
    data_sources, total_count = DataSource.search_with_filter(query, request_args, strictness,1, 10000, exclusions)
    return export_resource(DataSource, "data_sources_request.csv", data_sources)


@api.route('/api/data-sources/export/<application_id>', methods=['GET'])
@login_required
@admin_or_owner_required
def export_data_source_of_application(application_id):
    """Exporter les données d'une application
    ---
    get:
        summary: Exporter les données d'une application
        description: L'authentification est requise. Si l'utilisateur n'est pas admin mais est propriétaire d'application, il ne peut exporter des données que pour des applications dont il est propriétaire.
        parameters:
            - pathApplicationId

        responses:
            '200':
              description: Données exportées.
              content:
                application/csv:
                    schema:
                        $ref: "#/components/schemas/DataSourceCSV"

    """
    application = Application.query.get(application_id)
    return export_resource(DataSource, f"data_sources_of_{application.name}.csv", application.data_sources)


@api.route('/api/data-sources/export', methods=['GET'])
@login_required
@admin_required
def export_data_sources():
    """Exporter toutes les données
    ---
    get:
        summary: Exporter toutes les données
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        responses:
            '200':
              description: Données exportées.
              content:
                application/csv:
                    schema:
                        $ref: "#/components/schemas/DataSourceCSV"

    """
    return export_resource(DataSource, "data_sources.csv")


@api.route('/api/data-sources/import_by_application/<application_id>', methods=['POST', 'PUT'])
@login_required
@admin_or_owner_required
def import_data_sources_by_application(application_id):
    """Importer les données d'une application
    ---
    post:
        summary: Importer les données d'une application
        description: L'authentification est requise. Si l'utilisateur n'est pas admin mais est propriétaire d'application, il ne peut créer des données que pour des applications dont il est propriétaire.

        parameters:
            - pathApplicationId
        requestBody:
          description: Le CSV des données
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/DataSourceCSV"
        responses:
            '200':
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"

    put:
        summary: Remplacer les données d'une application
        description: L'authentification est requise. Si l'utilisateur n'est pas admin mais est propriétaire d'application, il ne peut modifier des données que pour des applications dont il est propriétaire.

        parameters:
            - pathApplicationId
        requestBody:
          description: Le CSV des données
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/DataSourceCSV"
        responses:
            '200':
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"

    """
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
    """Importer toutes les données
    ---
    post:
        summary: Importer toutes les données
        description: Toutes les données actuelles sont remplacées par cet import. L'authentification est requise. L'utilisateur doit être administrateur principal.

        requestBody:
          description: Le CSV des données
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/DataSourceCSV"
        responses:
            '200':
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"

    """
    try:
        import_resource(DataSource)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@api.route('/api/data-sources/reindex')
def reindex_data_sources():
    """Réindexer les données
    ---
    get:
      summary: Réindexer les données
      description:
      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/JsonResponse200"
    """
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
    """Obtenir des données avec recherche limitée
    ---
    get:
        summary: Obtenir des données avec recherche limitée
        description: Endpoint retournant une liste paginée de données basée sur une recherche.

        parameters:
            - searchQuery
            - pageDataSrc
            - countDataSrc
            - family
            - type
            - organization
            - application
            - referentiel
            - sensibility
            - open_data
            - exposition
            - origin
            - tag
            - strictness
            - toExclude

        responses:
            '200':
              description: Les données correspondante incluant l'application associées à la donnée.
              content:
                application/json:
                    schema:
                        type: object
                        properties:
                            results:
                                type: array
                                items:
                                    $ref: "#/components/schemas/DataSource"
                            total_count:
                                type: integer

    """
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
    """Obtenir le décompte de données par énumération
    ---
    get:
        summary: Obtenir le décompte de données par énumération

        parameters:
            - searchQuery
            - pageDataSrc
            - countDataSrc
            - family
            - type
            - organization
            - application
            - referentiel
            - sensibility
            - open_data
            - exposition
            - origin
            - tag
            - strictness
            - toExclude

        responses:
            '200':
              content:
                application/json:
                    schema:
                        type: object
                        properties:
                            results:
                                $ref: "#/components/schemas/EnumCount"
                            total_count:
                                type: integer

    """
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
    """Quantité de données
    ---
    get:
      summary: Quantité de données
      description: Recevoir la quantité totale de données existantes. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les donnnées dont l'utilisateur est propriétaire de l'application.

      responses:
        200:
          content:
            text/plain:
                schema:
                    type: integer
    """
    base_query = DataSource.query
    if not current_user.is_admin:
        base_query = base_query.filter(DataSource.owners.any(id=current_user.id))
    return str(base_query.count())


@api.route('/api/data-sources/families', methods=['GET'])
def fetch_data_source_families():
    """Obtenir les éléments de l'arbre des familles
    ---
    get:
      summary: Obtenir les éléments de l'arbre des familles

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/types', methods=['GET'])
def fetch_data_source_types():
    """Obtenir les éléments de l'arbre des types
    ---
    get:
      summary: Obtenir les éléments de l'arbre des types

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Type.get_tree_dict())


@api.route('/api/data-sources/applications', methods=['GET'])
def fetch_data_source_applications():
    """Obtenir les éléments de l'arbre d'applications
    ---
    get:
      summary: Obtenir les éléments de l'arbre d'applications
      description: Les applications ne peuvent pas avoir de children.

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/ApplicationTreeElems"
    """
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
    """Obtenir les éléments de l'arbre des organisations
    ---
    get:
      summary: Obtenir les éléments de l'arbre des organisations

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Organization.get_tree_dict())


@api.route('/api/data-sources/referentiels', methods=['GET'])
def fetch_data_source_referentiels():
    """Obtenir les éléments de l'arbre des référentiels
    ---
    get:
      summary: Obtenir les éléments de l'arbre des référentiels

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/sensibilities', methods=['GET'])
def fetch_data_source_sensibilities():
    """Obtenir les éléments de l'arbre des sensibilités
    ---
    get:
      summary: Obtenir les éléments de l'arbre des sensibilités

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Sensibility.get_tree_dict())


@api.route('/api/data-sources/open-data', methods=['GET'])
def fetch_data_source_open_data():
    """Obtenir les éléments de l'arbre des open data
    ---
    get:
      summary: Obtenir les éléments de l'arbre des open data

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(OpenData.get_tree_dict())


@api.route('/api/data-sources/expositions', methods=['GET'])
def fetch_data_source_expositions():
    """Obtenir les éléments de l'arbre des expositions
    ---
    get:
      summary: Obtenir les éléments de l'arbre des expositions

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Exposition.get_tree_dict())


@api.route('/api/data-sources/origins', methods=['GET'])
def fetch_data_source_origins():
    """Obtenir les éléments de l'arbre des origines
    ---
    get:
      summary: Obtenir les éléments de l'arbre des origines

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Origin.get_tree_dict())


@api.route('/api/data-sources/classifications', methods=['GET'])
def fetch_data_source_classifications():
    """Obtenir les éléments de l'arbre des axes d'analyse
    ---
    get:
      summary: Obtenir les éléments de l'arbre des axes d'analyse

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Family.get_tree_dict())


@api.route('/api/data-sources/tags', methods=['GET'])
def fetch_data_source_tags():
    """Obtenir les éléments de l'arbre des tags
    ---
    get:
      summary: Obtenir les éléments de l'arbre des tags

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Tag.get_tree_dict())


@api.route('/api/data-sources/<data_source_id>', methods=['GET'])
def read_data_source(data_source_id):
    """Obtenir une donnée
    ---
    get:
      summary: Obtenir une donnée
      parameters:
      - dataSourceId

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/DataSource"
    """
    data_source = get_data_source(data_source_id)
    return jsonify(data_source.to_dict())


@api.route('/api/data-sources/<data_source_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_data_source(data_source_id):
    """Modifier une donnée
    ---
    put:
      summary: Modifier une donnée
      description: L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint permet uniquement de modifier les données donc l'application appartenant à l'utilisateur.

      parameters:
      - dataSourceId

      requestBody:
          required: true
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DataSource"

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/DataSource"
    """
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


@api.route('/api/data-sources/<data_source_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_data_source(data_source_id):
    """Supprimer une donnée
    ---
    delete:
      summary: Supprimer une donnée
      description: L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint permet uniquement de supprimer les données donc l'application appartenant à l'utilisateur.

      parameters:
      - dataSourceId

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/JsonResponse200"
    """
    data_source = get_data_source(data_source_id)
    data_source.delete()
    db.session.commit()
    DataSource.remove_from_index(data_source)
    return jsonify(dict(description='OK', code=200))
