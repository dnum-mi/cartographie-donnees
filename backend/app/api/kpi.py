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


@api.route('/api/kpi/count', methods=['GET'])
@login_required
@admin_required
def get_count_kpi():
    try:
        count = db.session.query(RoutingKPI.id).count() + db.session.query(SearchingKPI.id).count()
        return jsonify({"count": count})

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/kpi/routing', methods=['GET'])
@login_required
@admin_required
def get_routing_kpi():
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
    current_date = datetime.date.today()
    start_date = current_date - datetime.timedelta(days=365)
    delete_searching = db.session.query(SearchingKPI).filter(SearchingKPI.date <= start_date).delete()
    delete_routing = db.session.query(RoutingKPI).filter(RoutingKPI.date <= start_date).delete()
    db.session.commit()
    return jsonify(dict(description=f"OK, {delete_searching + delete_routing} deleted", code=200))


@api.route('/api/kpi/routing/export', methods=['GET'])
@login_required
@admin_required
def export_routing_kpi():
    return export_resource(RoutingKPI, "historique_navigation.csv")


@api.route('/api/kpi/searching/export', methods=['GET'])
@login_required
@admin_required
def export_searching_kpi():
    return export_resource(SearchingKPI, "historique_recherche.csv")

# @api.route('/api/kpi/all', methods=['DELETE'])
# @login_required
# @admin_required
# def delete_kpi_all():
#     delete_searching = db.session.query(SearchingKPI).delete()
#     delete_routing = db.session.query(RoutingKPI).delete()
#     db.session.commit()
#     return jsonify(dict(description=f"OK, {delete_searching+delete_routing} deleted", code=200))
