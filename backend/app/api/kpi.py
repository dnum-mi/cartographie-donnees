import datetime
from werkzeug.exceptions import BadRequest
from flask import jsonify, request

from app import db
from app.models.RoutingKPI import RoutingKPI
from . import api


@api.route('/api/routing-kpi', methods=['POST'])
def create_routing_kpi_item():
    try:
        json = request.get_json(force=True)
        location = json.get("location", {})
        user = json.get("user", {})
        routing_kpi = RoutingKPI.from_dict({
            "pathname": location.get("pathname"),
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
