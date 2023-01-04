import copy
import datetime
import json

import unidecode
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.exceptions import BadRequest

from app import db
from app.api.applications import get_application_by_name
from app.api.commons import import_resource, export_resource
from app.api.enumerations import get_type_by_name, get_family_by_name, get_analysis_axis_by_name, \
    get_exposition_by_name, get_sensibily_by_name, get_open_data_by_name, \
    get_update_frequency_by_name, get_origin_by_name, get_tag_by_name, get_organization_by_name
from app.constants import field_english_to_french_dic
from app.decorators import admin_required, admin_or_owner_required
from app.exceptions import CSVFormatError
from app.models import DataSource, Application, Type, Family, Organization, Exposition, Sensibility, OpenData, \
    get_enumeration_model_by_name, Origin, Tag, SearchingKPI
from . import api
from ..search.enums import Strictness


@api.route('/api/data-sources', methods=['GET'])
@login_required
def fetch_data_sources():
    """Obtenir des données
    ---
    get:
        tags:
            - Donnees
        summary: Obtenir des données
        description: Endpoint retournant une liste paginée de données. L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les données donc l'application appartenant à l'utilisateur.
        parameters:
            - pageDataSrc
            - countDataSrc

        responses:
            '200':
              description: Les données correspondantes incluant l'application associées à la donnée.
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
    datasources = sorted(datasources, key=lambda ds: str.lower(unidecode.unidecode(ds.name)))
    datasources = datasources[(page - 1) * count:page * count]
    return jsonify(dict(
        total_count=total_count,
        results=[datasource.to_dict() for datasource in datasources]
    ))


@api.route('/api/data-sources/highlights', methods=['GET'])
def fetch_highlighted_data_sources():
    """Obtenir les données mises en avant
    ---
    get:
        tags:
            - Donnees
        summary: Obtenir les données mises en avant
        description: Endpoint retournant une liste des données mises en avant par l'administrateur général. Aucune authentification n'est requise.
        responses:
            '200':
              description: Les données mises en avant incluant l'application associées à la donnée.
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
    highlighted_data_sources = DataSource.query \
        .filter(DataSource.highlights_index.isnot(None)) \
        .order_by(DataSource.highlights_index.asc()) \
        .all()
    return jsonify(dict(
        total_count=len(highlighted_data_sources),
        results=[datasource.to_dict() for datasource in highlighted_data_sources]
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
@admin_or_owner_required
def create_data_source():
    """Créer une donnée
    ---
    post:
        tags:
            - Donnees
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
        json["analysis_axis"] = get_analysis_axis_by_name(json.get("analysis_axis_name"))
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
    """Exporter les données de recherche
    ---
    get:
        tags:
            - Donnees
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
    data_sources, total_count = DataSource.search_with_filter(query, request_args, strictness, 1, 10000, exclusions)
    return export_resource(DataSource, "data_sources_request.csv", data_sources)


@api.route('/api/data-sources/export/<application_id>', methods=['GET'])
@login_required
@admin_or_owner_required
def export_data_source_of_application(application_id):
    """Exporter les données d'une application
    ---
    get:
        tags:
            - Donnees
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
        tags:
            - Donnees
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
        tags:
            - Donnees
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
        tags:
            - Filtres
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
        tags:
            - Donnees
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
        warning = import_resource(DataSource)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    if warning:
        return jsonify({'code': 200, **warning})
    return jsonify(dict(description='OK', code=200))


@api.route('/api/data-sources/reindex')
def reindex_data_sources():
    """Réindexer les données
    ---
    get:
      tags:
        - Donnees
      summary: Réindexer les données
      description: Synchronisation de l'index elasticsearch correspondant aux données avec la base de données.
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
                    'exposition', 'origin', 'analysis_axis', 'tag']

    query = request.args.get('q', '', type=str)
    strictness = request.args.get('strictness', '', type=str)
    strictness = Strictness(strictness)
    exclusions = request.args.get('toExclude', '', type=str)
    to_return = {}
    for filter in filters_list:
        temp = request.args.get(filter, '', type=str)
        temp = [] if not temp else temp.split(";")
        to_return[filter] = temp
    return query, to_return, strictness, exclusions


def add_query_to_db(index, query, request_args, strictness, exclusions):
    # Get elasticsearch string query tokens after analyzer
    text_separator = " "
    raw_text_tokens = current_app.elasticsearch.indices.analyze(index=index, body={"text": query})["tokens"]
    text_query = text_separator.join([element["token"] for element in raw_text_tokens])

    raw_exclusions_tokens = current_app.elasticsearch.indices.analyze(index=index, body={"text": exclusions})["tokens"]
    exclusions_token = text_separator.join([element["token"] for element in raw_exclusions_tokens])

    query_parameters = {
        "text_query": text_query,
        "text_operator": strictness.value,
        "exclusion": exclusions_token,
        "filters_query": json.dumps({
            k: v for k, v in request_args.items() if len(v) > 0
        }, ensure_ascii=False),
        "date": datetime.datetime.now()
    }
    searching_kpi = SearchingKPI.from_dict(query_parameters)
    db.session.add(searching_kpi)
    db.session.commit()


@api.route('/api/data-sources/search', methods=['GET'])
def search_data_sources():
    """Obtenir des données avec recherche limitée
    ---
    get:
        tags:
            - Donnees
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

    # Add query to DB for KPI
    if not current_user.is_authenticated or not current_user.is_admin:
        add_query_to_db(DataSource.__tablename__, query, request_args, strictness, exclusions)

    # search and return results
    data_sources, total_count = DataSource.search_with_filter(
        query, request_args, strictness, page, count, exclusions)
    return jsonify(dict(
        total_count=total_count,
        results=[data_source.to_dict() for data_source in data_sources]
    ))


@api.route('/api/data-sources/search-metadata', methods=['GET'])
def get_search_metadata():
    """Obtenir les métadata de la recherche: décompte de données par énumération et ids des données trouvées par la recherche
    ---
    get:
        tags:
            - Donnees
        summary: Obtenir les métadata de la recherche

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
              content:
                application/json:
                    schema:
                        type: object
                        properties:
                            count_by_enum:
                                $ref: "#/components/schemas/EnumCount"
                            data_source_ids:
                                type: array
                                items:
                                    type: integer

    """
    query, request_args, strictness, exclusions = get_request_args_data_source(request)
    count_dict, total_count, data_source_ids = DataSource.query_count(query, request_args, strictness, exclusions)
    return jsonify(dict(
        count_by_enum=count_dict,
        data_source_ids=data_source_ids
    ))


@api.route('/api/data-sources/count', methods=['GET'])
@login_required
def count_data_sources():
    """Nombre de données
    ---
    get:
      tags:
        - Donnees
      summary: Nombre de données
      description: Recevoir le nombre total de données existantes. Si l'utilisateur est propriétaire d'application, ce endpoint retourne uniquement les donnnées dont l'utilisateur est propriétaire de l'application.

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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
            'label': application.long_name,
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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
      summary: Obtenir les éléments de l'arbre des origines

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/TreeElems"
    """
    return jsonify(Origin.get_tree_dict())


@api.route('/api/data-sources/analysis-axis', methods=['GET'])
def fetch_data_source_analysis_axis():
    """Obtenir les éléments de l'arbre des axes d'analyse
    ---
    get:
      tags:
        - Donnees
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
      tags:
        - Donnees
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
      tags:
        - Donnees
      summary: Obtenir une donnée
      parameters:
      - data_source_id

      responses:
        200:
          content:
            application/json:
                schema:
                    $ref: "#/components/schemas/DataSource"
    """
    data_source = get_data_source(data_source_id)
    return jsonify(data_source.to_dict(populate_statistics=True))


@api.route('/api/data-sources/<data_source_id>', methods=['PUT'])
@login_required
@admin_or_owner_required
def update_data_source(data_source_id):
    """Modifier une donnée
    ---
    put:
      tags:
        - Donnees
      summary: Modifier une donnée
      description: L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint permet uniquement de modifier les données donc l'application appartenant à l'utilisateur.

      parameters:
      - data_source_id

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
        json["analysis_axis"] = get_analysis_axis_by_name(json.get("analysis_axis_name"))
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


@api.route('/api/data-sources/mass-edition', methods=['PUT'])
@login_required
@admin_required
def mass_edit_data_sources():
    """Modifier plusieurs données
    ---
    put:
      tags:
        - Donnees
      summary: Modifier plusieurs données
      description: L'authentification est requise. Si l'utilisateur est propriétaire d'application, ce endpoint permet uniquement de modifier les données donc l'application appartenant à l'utilisateur.

      requestBody:
          required: true
          content:
            application/json:
                schema:
                    type: object
                    properties:
                        data_source_ids:
                            type: array
                            items:
                                type: integer
                        edition_type:
                            type: string
                        key:
                            type: string
                        value:
                            type: string
                        type:
                            type: string | undefined
      responses:
        200:
          content:
            application/json:
                schema:
                    type: object
                    properties:
                        data_source_ids:
                            type: array
                            items:
                                type: integer
    """
    try:
        req_json = request.get_json()
        data_source_ids = req_json["data_source_ids"]
        json_key = req_json["key"]
        json_value = req_json["value"]

        if req_json["edition_type"] == "application":
            if json_key == "organization_name":
                edition_key = "organization_id"
                edition_value = get_organization_by_name(json_value)
            else:
                raise BadRequest(f"key {json_key} is not editable in type application")

            application_ids = db.session.query(DataSource.application_id) \
                .filter(DataSource.id.in_(data_source_ids)) \
                .distinct(DataSource.application_id)
            application_list = Application.query.filter(Application.id.in_(application_ids)).all()
            for application in application_list:
                application.update_from_key_value(edition_key, edition_value)
            db.session.commit()

            for application in application_list:
                # Get all datasource of application
                # reindex them
                data_sources = DataSource.query.filter(DataSource.application_id == application.id).all()
                DataSource.bulk_add_to_index(data_sources)
                Application.add_to_index(application)

            return jsonify({"application_ids": [row._asdict() for row in application_ids.all()]})

        elif req_json["edition_type"] == "datasource":
            if json_key == "application":
                edition_key = "application_id"
                edition_value = get_application_by_name(json_value.get("name"))
            elif json_key == "origin_applications":
                edition_key = "origin_applications"
                edition_value = get_origin_applications(json_value)
            elif json_key == "family_name":
                edition_key = "families"
                edition_value = get_family_by_name(json_value)
            elif json_key == "analysis_axis_name":
                edition_key = "analysis_axis"
                edition_value = get_analysis_axis_by_name(json_value)
            elif json_key == "reutilizations":
                edition_key = "reutilizations"
                edition_value = get_reutilizations(json_value)
            elif json_key == "tag_name":
                edition_key = "tags"
                edition_value = get_tag_by_name(json_value)
            elif json_key == "type_name":
                edition_key = "type_id"
                edition_value = get_type_by_name(json_value)
            elif json_key == "exposition_name":
                edition_key = "expositions"
                edition_value = get_exposition_by_name(json_value)
            elif json_key == "sensibility_name":
                edition_key = "sensibility_id"
                edition_value = get_sensibily_by_name(json_value)
            elif json_key == "open_data_name":
                edition_key = "open_data_id"
                edition_value = get_open_data_by_name(json_value)
            elif json_key == "update_frequency_name":
                edition_key = "update_frequency_id"
                edition_value = get_update_frequency_by_name(json_value)
            elif json_key == "origin_name":
                edition_key = "origin_id"
                edition_value = get_origin_by_name(json_value)
            elif json_key == "is_reference":
                edition_key = "is_reference"
                edition_value = json_value
            else:
                raise BadRequest(f"key {json_key} is not editable in type datasource")

            data_source_list = DataSource.query.filter(DataSource.id.in_(data_source_ids)).all()
            warning = ""

            # Replacement
            if req_json["type"] == "":
                for data_source in data_source_list:
                    data_source.update_from_key_value(edition_key, edition_value)

            # Multiple add
            elif req_json["type"] == "add":
                for data_source in data_source_list:
                    new_values = list(set(getattr(data_source, edition_key) + edition_value))
                    data_source.update_from_key_value(edition_key, new_values)

            # Multiple remove
            elif req_json["type"] == "remove":
                remove_failures = []
                data_source_ids = []

                for data_source in data_source_list:
                    current_values = getattr(data_source, edition_key)
                    new_values = [value for value in current_values if value not in edition_value]
                    if req_json["required"] and len(new_values) == 0:
                        remove_failures.append(data_source.id)
                        continue
                    data_source.update_from_key_value(edition_key, new_values)
                    data_source_ids.append(data_source.id)

                if len(remove_failures) > 0:
                    warning = f"Le champ {field_english_to_french_dic[json_key]} est obligatoire. " \
                              f"{len(remove_failures)} {'données' if len(remove_failures)>1 else 'donnée'} " \
                              f"n'ont pas été modifié pour préserver cette contrainte. " \
                              f"Liste d'identifiants: {remove_failures}"

            else:
                raise BadRequest(f"type {req_json['type']} should be 'add', 'remove' or empty string")

            db.session.commit()
            DataSource.bulk_add_to_index(data_source_list)

            return jsonify({"data_source_ids": data_source_ids, "warning": warning})

        else:
            raise BadRequest(f"edition_type {req_json['edition_type']} should be either datasource or application")
    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/data-sources/<data_source_id>', methods=['DELETE'])
@login_required
@admin_or_owner_required
def delete_data_source(data_source_id):
    """Supprimer une donnée
    ---
    delete:
      tags:
        - Donnees
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
    db.session.delete(data_source)
    db.session.commit()
    DataSource.remove_from_index(data_source)
    return jsonify(dict(description='OK', code=200))
