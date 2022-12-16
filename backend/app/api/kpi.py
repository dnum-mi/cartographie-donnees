import datetime

from flask_login import login_required
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from sqlalchemy import func, desc

from app import db
from app.models import RoutingKPI, SearchingKPI, DataSource, Application
import json
from app.api.commons import export_resource

from app.decorators import admin_required
from . import api


@api.route('/api/kpi/routing', methods=['POST'])
def create_routing_kpi_item():
    """Ajouter une ligne à la table routingKPI
    ---
    post:
      tags:
        - Indicateurs
      summary: Ajouter une ligne à la table routingKPI
      requestBody:
          description: Un objet JSON représentant une ligne de la table routingKPI
          required: true
          content:
            application/json:
                schema:
                  type: object
                  properties:
                    location:
                        type: object
                        properties:
                            pathname:
                                type: string
                            search:
                                type: string
                            hash:
                                type: string
                    user:
                        type: object
                        properties:
                            is_general_admin:
                                type: boolean
                            is_simple_admin:
                                type: boolean
      responses:
        200:
          description: JSON representant la ligne créée dans routingKPI
          content:
                application/json:
                    schema:
                        type: object
                        properties:
                          date:
                            type: string
                          id:
                            type: integer
                          is_general_admin:
                            type: boolean
                          is_simple_admin:
                            type: boolean
                          pathname:
                            type: string
                          search:
                            type: string
                          subpath:
                            type: string
    """
    try:
        json = request.get_json(force=True)
        location = json.get("location", {})
        path = location.get("pathname").split("/")
        pathname = path[1]
        subpath = "/".join(path[2:])
        user = json.get("user", {})
        routing_kpi = RoutingKPI.from_dict({
            "pathname": pathname,
            "subpath": subpath,
            "search": location.get("search"),
            "is_general_admin": user.get("is_general_admin"),
            "is_simple_admin": user.get("is_simple_admin"),
            "date": datetime.datetime.now()
        })
        db.session.add(routing_kpi)
        db.session.commit()
        return jsonify(routing_kpi.to_dict())

    except Exception as e:
        raise BadRequest(str(e))


def row_to_dict(rowList):
    return [row._asdict() for row in rowList]


def getDatesFromArgs(args):
    start_date = datetime.datetime.fromisoformat(args.get('start_date')[:-1])
    end_date = datetime.datetime.fromisoformat(args.get('end_date')[:-1])
    end_date += +datetime.timedelta(days=1)
    return start_date, end_date


@api.route('/api/kpi/admin', methods=['GET'])
@login_required
@admin_required
def get_admin_kpi():
    """ Obtenir les indicateurs pour l'administration
    ---
    get:
      tags:
        - Indicateurs
      summary: Obtenir les indicateurs pour l'administration
      description: L'authentification est requise. L'utilisateur doit être administrateur général.
      responses:
        200:
          description: Un JSON contenant les indicateurs pour l'administration
          content:
                application/json:
                    schema:
                        type: object
                        properties:
                            avg_application_description_level:
                                type: float
                            avg_datasource_description_level:
                                type: float
                            avg_datasources_per_application:
                                type: float
                            avg_referentiels_per_application:
                                type: float
                            avg_reutilizations_per_application:
                                type: float
                            count_applications_with_referentiels:
                                type: integer
                            count_applications_with_reutilizations:
                                type: integer
    """
    try:
        kpis = {}

        application_count = db.session.query(func.count(Application.id)).scalar()

        kpis["avg_datasources_per_application"] = round(
            DataSource.query.count()
            / application_count,
            2
        )

        kpis["avg_referentiels_per_application"] = round(
            DataSource.query.filter_by(is_reference=True).count()
            / application_count,
            2
        )

        kpis["count_applications_with_referentiels"] = DataSource.query \
            .filter_by(is_reference=True) \
            .distinct(DataSource.application_id) \
            .count()

        reutilizations_per_application = [appli.reutilization_count for appli in Application.query.all()]
        kpis["avg_reutilizations_per_application"] = round(
            sum(reutilizations_per_application) / len(reutilizations_per_application),
            2
        )

        kpis["count_applications_with_reutilizations"] = len(
            [element for element in reutilizations_per_application if element != 0])

        datasource_description_level = []
        application_description_level = {}
        for ds in DataSource.query.all():
            datasource_description_level += [ds.datasource_description_level]
            application_description_level[ds.application_id] = \
                application_description_level.get(ds.application_id, []) + [ds.datasource_description_level]

        kpis["avg_datasource_description_level"] = round(
            sum(datasource_description_level) / len(datasource_description_level)
            , 2
        )

        kpis["avg_application_description_level"] = round(
            sum(  # average of average description level per application
                sum(temp) / len(temp) for temp in application_description_level.values()
            ) / len(application_description_level.keys())
            , 2
        )

        return jsonify(kpis)

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/kpi/count', methods=['GET'])
@login_required
@admin_required
def get_count_kpi():
    """ Obtenir le nombre de ligne stockés pour les indicateurs de fréquentation
    ---
    get:
      tags:
        - Indicateurs
      summary: Obtenir le nombre de ligne stockés pour les indicateurs de fréquentation
      description: L'authentification est requise. L'utilisateur doit être administrateur général.
      responses:
        200:
          description: Un JSON contenant le nombre de lignes
          content:
                application/json:
                    schema:
                        type: object
                        properties:
                            count:
                                type: integer
    """
    try:
        count = db.session.query(RoutingKPI.id).count() + db.session.query(SearchingKPI.id).count()
        return jsonify({"count": count})

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/kpi/routing', methods=['GET'])
@login_required
@admin_required
def get_routing_kpi():
    """ Obtenir les indicateurs types de page et fiches donnée visités entre deux dates
    ---
    get:
        tags:
            - Indicateurs
        summary: Obtenir les indicateurs types de page et fiches donnée visités entre deux dates
        description: L'authentification est requise. L'utilisateur doit être administrateur général.
        parameters:
            - start_date
            - end_date

        responses:
            200:
                description: Un JSON contenant les indicateurs types de page et fiches donnée visités entre start_date et end_date
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                datasource_count_visits:
                                    type: array
                                    items:
                                        type: object
                                        properties:
                                            application_name:
                                                type: string
                                            count:
                                                type: integer
                                            data_source_id:
                                                type: integer
                                            data_source_name:
                                                type: string
                                path_count_visits:
                                    type: array
                                    items:
                                        type: object
                                        properties:
                                            count:
                                                type: integer
                                            pathname:
                                                type: ["search", "login", "admin", "data-source"]
        """

    try:

        kpis = {}
        start_date, end_date = getDatesFromArgs(request.args)

        filter_by_date = db.session.query(RoutingKPI.id). \
            filter(RoutingKPI.date >= start_date). \
            filter(RoutingKPI.date < end_date)

        # Count number of visit for each section (login, datasource, admin, search)
        kpis["path_count_visits"] = row_to_dict(
            db.session.query(RoutingKPI.pathname, func.count(RoutingKPI.id).label("count")).
            filter(RoutingKPI.id.in_(filter_by_date)).
            group_by(RoutingKPI.pathname).
            filter(RoutingKPI.pathname.in_(["search", "data-source", "admin", "login"])).
            order_by(desc("count")).
            all()
        )

        # Count number of visit for each datasource
        main_query = (
            db.session.query(RoutingKPI.subpath.label("data_source_id"), func.count(RoutingKPI.id).label("count")).
            filter(RoutingKPI.id.in_(filter_by_date)).
            group_by(RoutingKPI.pathname, RoutingKPI.subpath).
            having(RoutingKPI.pathname == "data-source").subquery()
        )

        kpis["datasource_count_visits"] = row_to_dict(
            db.session.query(main_query.c.count, main_query.c.data_source_id, DataSource.name.label("data_source_name"),
                             Application.name.label("application_name")).
            join(DataSource, db.cast(DataSource.id, db.String) == main_query.c.data_source_id).
            join(Application, Application.id == DataSource.application_id).
            order_by(desc("count")).
            limit(50).
            all()
        )

        return jsonify(kpis)

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/kpi/searching', methods=['GET'])
@login_required
@admin_required
def get_search_kpi():
    """ Obtenir les indicateurs filtre et terme de recherche entre deux dates
    ---
    get:
        tags:
            - Indicateurs
        summary: Obtenir les indicateurs filtre et terme de recherche entre deux dates
        description: L'authentification est requise. L'utilisateur doit être administrateur général.
        parameters:
            - start_date
            - end_date

        responses:
            200:
                description: Un JSON contenant les indicateurs filtre et terme de recherche entre start_date et end_date
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                filters_queries:
                                    description: "[[Nom du filtre, Nombre d'utilisations],...]"
                                    type: array
                                    items:
                                        type: array
                                text_queries:
                                    description: "[[Terme de recherche, Nombre d'utilisations],...]"
                                    type: array
                                    items:
                                        type: array
        """

    try:

        start_date, end_date = getDatesFromArgs(request.args)

        filter_by_date = db.session.query(SearchingKPI.id). \
            filter(SearchingKPI.date >= start_date). \
            filter(SearchingKPI.date < end_date)

        # get all search queries
        search_list = db.session.query(SearchingKPI.text_query, SearchingKPI.filters_query). \
            filter(SearchingKPI.id.in_(filter_by_date)). \
            all()

        # Parse through queries and create KPi
        text_queries = {}
        filters_queries = {}
        text_separator = " "

        for search in search_list:

            # Text search KPI
            for text in search.text_query.split(text_separator):
                if text != "":
                    text_queries[text] = text_queries.get(text, 0) + 1

            # filters search KPI
            filters_dict = json.loads(search.filters_query)
            filter_gen = (element for filter_list in filters_dict.values() for element in filter_list)
            for filt in filter_gen:
                filters_queries[filt] = filters_queries.get(filt, 0) + 1

        # sort
        ordered_text_queries = sorted(text_queries.items(), key=lambda item: item[1], reverse=True)[:50]
        ordered_filters_queries = sorted(filters_queries.items(), key=lambda item: item[1], reverse=True)[:50]

        return jsonify({"text_queries": ordered_text_queries, "filters_queries": ordered_filters_queries})
        # return jsonify(row_to_dict(search_list))

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/kpi/year', methods=['DELETE'])
@login_required
@admin_required
def delete_kpi_year():
    """Supprimer les données de navigation plus vieilles que 1 an
    ---
    delete:
        tags:
            - Indicateurs
        summary: Supprimer les données de navigation plus vieilles que 1 an
        description: L'authentification est requise. L'utilisateur doit être administrateur général.

        responses:
            '200':
              content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"
    """
    try:
        current_date = datetime.date.today()
        start_date = current_date - datetime.timedelta(days=365)
        delete_searching = db.session.query(SearchingKPI).filter(SearchingKPI.date <= start_date).delete()
        delete_routing = db.session.query(RoutingKPI).filter(RoutingKPI.date <= start_date).delete()
        db.session.commit()
        return jsonify(dict(description=f"OK, {delete_searching + delete_routing} deleted", code=200))

    except Exception as e:
        raise BadRequest(str(e))



@api.route('/api/kpi/routing/export', methods=['GET'])
@login_required
@admin_required
def export_routing_kpi():
    """Exporter les données de la table routingKPI (indicateurs fiche donnée et type de page)
    ---
    get:
        tags:
            - Indicateurs
        summary: Exporter les données de la table routingKPI (indicateurs fiche donnée et type de page)
        description: L'authentification est requise. L'utilisateur doit être administrateur général.

        responses:
            '200':
              description: La table routingKPI exportées.
              content:
                application/csv:
                    schema:
                        type: object
                        properties:
                            id:
                                type: integer
                            URL:
                                type: string
                            Complément d'URL:
                                type: string
                            Recherche:
                                type: string
                            Administrateur général?:
                                type: boolean
                            Administrateur?:
                                type: boolean
                            Date:
                                type: date
    """
    return export_resource(RoutingKPI, "historique_navigation.csv")


@api.route('/api/kpi/searching/export', methods=['GET'])
@login_required
@admin_required
def export_searching_kpi():
    """Exporter les données de la table searchingKPI (indicateurs filtre et terme de recherche)
    ---
    get:
        tags:
            - Indicateurs
        summary: Exporter les données de la table searchingKPI (indicateurs filtre et terme de recherche)
        description: L'authentification est requise. L'utilisateur doit être administrateur général.

        responses:
            '200':
              description: La table searchingKPI exportées.
              content:
                application/csv:
                    schema:
                        type: object
                        properties:
                            id:
                                type: integer
                            Recherche textuelle:
                                type: string
                            Type de recherche textuelle:
                                type: string
                            Exclusion:
                                type: string
                            Filtre:
                                type: object
                                description: "{Type de filtre: [Noms de filtres, ...]}"
                            Date:
                                type: date
    """

    return export_resource(SearchingKPI, "historique_recherche.csv")