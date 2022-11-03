import datetime
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from sqlalchemy import func, desc

from app import db
from app.models.RoutingKPI import RoutingKPI
from . import api


@api.route('/api/routing-kpi', methods=['POST'])
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


@api.route('/api/routing-kpi', methods=['GET'])
def get_routing_kpi():
    try:

        kpis = {}
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        filter_by_date = db.session.query(RoutingKPI.id). \
            filter(RoutingKPI.date >= start_date). \
            filter(RoutingKPI.date < end_date).subquery()

        # Count number of visit for each section (login, datasource, admin, search)
        kpis["path_count_visits"] = row_to_dict(
            db.session.query(RoutingKPI.pathname, func.count(RoutingKPI.id).label("count")).
            filter(RoutingKPI.id.in_(filter_by_date)).
            group_by(RoutingKPI.pathname).
            order_by(desc("count")).
            all()
        )

        # Count number of visit for each datasource
        kpis["datasource_count_visits"] = row_to_dict(
            db.session.query(RoutingKPI.subpath, func.count(RoutingKPI.id).label("count")).
            filter(RoutingKPI.id.in_(filter_by_date)).
            group_by(RoutingKPI.pathname, RoutingKPI.subpath).
            having(RoutingKPI.pathname == "data-source").
            order_by(desc("count")).
            limit(50).
            all()
        )

        return jsonify(kpis)

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/search-kpi', methods=['GET'])
def get_search_kpi():
    try:
        kpis = {}

        return jsonify(kpis)

    except Exception as e:
        raise BadRequest(str(e))
