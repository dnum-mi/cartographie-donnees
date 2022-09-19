from collections import defaultdict
from werkzeug.exceptions import BadRequest
from flask import jsonify, request, abort
from flask_login import login_required, current_user

from app import db
from app.models import User, Application
from app.decorators import admin_required
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource
from app.search import remove_accent
from app.models.WildCard import WildCard

from . import api

# TODO prevent adding new (namespace,key)

@api.route('/api/wild-cards', methods=['POST'])
@login_required
@admin_required
def create_update_wildcards():
    try:
        json = request.get_json(force=True)
        print(json)
        data = json.get("data",[])
        wild_cards = []

        for item in data:            
            wild_card = WildCard.query.filter_by(namespace=item["namespace"], key=item["key"]).one_or_none()
            if wild_card is None:
                wild_card = WildCard.from_dict(item)
                db.session.add(wild_card)
            else:
                wild_card.update_from_dict(item)
            
            wild_cards.append(wild_card)

        db.session.commit()
        return jsonify([wild_card.to_dict() for wild_card in wild_cards])

    except Exception as e:
        raise BadRequest(str(e))

@api.route('/api/wild-cards', methods=['GET'])
def fetch_wild_cards():
    wild_cards = WildCard.query.all()
    return jsonify([wild_card.to_dict() for wild_card in wild_cards])

@api.route('/api/wild-cards/<namespace>', methods=['GET'])
def fetch_wild_cards_by_namespace(namespace):
    wild_cards = WildCard.query.filter_by(namespace=namespace).all()
    wild_cards_list = [wild_card.to_dict() for wild_card in wild_cards]

    # Transform to {namespace: {key:value}} format
    wild_cards_dict = defaultdict(dict)
    for wc in wild_cards_list:
        wild_cards_dict[wc['namespace']][wc['key']] = wc['value']

    return jsonify(wild_cards_dict)



@api.route('/api/wild-cards/import', methods=['POST'])
@login_required
@admin_required
def import_wild_cards():
    try:
        import_resource(WildCard)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))

@api.route('/api/wild-cards/export', methods=['GET'])
@login_required
@admin_required
def export_wild_cards():
    return export_resource(WildCard, "wild_cards.csv")
