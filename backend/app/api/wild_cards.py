from collections import defaultdict
from werkzeug.exceptions import BadRequest
from flask import jsonify, request
from flask_login import login_required

from app import db
from app.decorators import admin_required
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource
from app.models.WildCard import WildCard
from app.models import DataSource, Application
from app.search import remove_accent

from . import api

@api.route('/api/wild-cards', methods=['GET'])
def fetch_wild_cards():
    """ Obtenir toutes les wildcards (Paramètres)
    ---
    get:
      tags:
        - Wildcards
      summary: Obtenir toutes les wildcards (Paramètres)
      responses:
        200:
          description: Une liste de toutes les wildcards existantes
          content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: "#/components/schemas/Wildcard"
    """
    wild_cards = WildCard.query.all()
    return jsonify([wild_card.to_dict() for wild_card in wild_cards])


@api.route('/api/wild-cards/<namespace>', methods=['GET'])
def fetch_wild_cards_by_namespace(namespace):
    """ Obtenir toutes les wildcards de type <namespace>
    ---
    get:
      tags:
        - Wildcards
      summary: Obtenir toutes les wildcards de type <namespace>
      parameters:
        - namespace

      responses:
        200:
          description: Une liste de toutes les wildcards de type <namespace>
          content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: "#/components/schemas/Wildcard"
    """

    wild_cards = WildCard.query.filter_by(namespace=namespace).all()
    wild_cards_list = [wild_card.to_dict() for wild_card in wild_cards]

    # Transform to {namespace: {key:value}} format
    wild_cards_dict = defaultdict(dict)
    if len(wild_cards_list) > 0:
        for wc in wild_cards_list:
            wild_cards_dict[wc['namespace']][wc['key']] = wc['value']
    else:
        wild_cards_dict[namespace] = {}

    return jsonify(wild_cards_dict)

@api.route('/api/wild-cards', methods=['POST'])
@login_required
@admin_required
def create_update_wildcards():
    """Créer ou modifier plusieurs wildcards
    ---
    post:
      tags:
        - Wildcards
      summary: Créer ou modifier plusieurs nouvelles wildcards
      description: L'authentification est requise. L'utilisateur doit être administrateur général.
      requestBody:
          description: Un objet JSON contenant une liste de wilcards
          required: true
          content:
            application/json:
                schema:
                  type: object
                  properties:
                    data:
                      type: array
                      items:
                        $ref: "#/components/schemas/Wildcard"
      responses:
        200:
          description: Une liste des objets wildcard qui viennent d'être créés ou modifiés
          content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: "#/components/schemas/Wildcard"
    """

    try:
        json = request.get_json(force=True)
        data = json.get("data", [])
        wild_cards = []
        requires_reindex = False

        for item in data:
            wild_card = WildCard.query.filter_by(namespace=item["namespace"], key=item["key"]).one_or_none()
            if item['namespace'] == 'synonyme':
                item['value'] = remove_accent(item['value'])
                requires_reindex = True
            if wild_card is None:
                wild_card = WildCard.from_dict(item)
                db.session.add(wild_card)
            else:
                wild_card.update_from_dict(item)

            wild_cards.append(wild_card)

        db.session.commit()
        if requires_reindex:
            DataSource.reindex()
            Application.reindex()
        return jsonify([wild_card.to_dict() for wild_card in wild_cards])

    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/wild-cards/import', methods=['POST'])
@login_required
@admin_required
def import_wild_cards():
    """Importer les wildcards
    ---
    post:
      tags:
        - Wildcards
      summary: Importer les wildcards
      description: "Importer et remplacer toutes les wildcards à partir d'un CSV. L'authentification est requise.
      L'utilisateur doit être administrateur général."

      requestBody:
          description: Le CSV contenant les wildcards
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/WildcardCSV"
      responses:
        200:
          content:
                application/json:
                    schema:
                        $ref: "#/components/schemas/JsonResponse200"
    """
    try:
        import_resource(WildCard)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@api.route('/api/wild-cards/export', methods=['GET'])
@login_required
@admin_required
def export_wild_cards():
    """Exporter toutes les wildcards
    ---
    get:
        tags:
            - Wildcards
        summary: Exporter toutes les wildcards
        description: L'authentification est requise. L'utilisateur doit être administrateur général.

        responses:
            '200':
              description: Wildcards exportées.
              content:
                application/csv:
                    schema:
                        $ref: "#/components/schemas/WildcardCSV"

    """
    return export_resource(WildCard, "wild_cards.csv")
