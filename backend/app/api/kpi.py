import datetime
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from sqlalchemy import func

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
        path_count = row_to_dict(
            db.session.query(RoutingKPI.pathname, func.count(RoutingKPI.id).label("count")).
            group_by(RoutingKPI.pathname).all()
        )

        datasource_views = row_to_dict(
            db.session.query(RoutingKPI.subpath, func.count(RoutingKPI.id).label("count")).
            group_by(RoutingKPI.pathname, RoutingKPI.subpath).
            having(RoutingKPI.pathname == "data-source").
            all()
        )

        return jsonify({"path_count": path_count, "datasource_views": datasource_views})

    except Exception as e:
        raise BadRequest(str(e))
