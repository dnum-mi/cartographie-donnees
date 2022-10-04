from werkzeug.exceptions import BadRequest
from flask import jsonify, request, abort
from flask_login import login_required, current_user

from app import db
from app.models import User, Application
from app.decorators import admin_required
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource
from app.search import remove_accent

from . import api


@api.route('/api/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    """Créer un nouvel utilisateur
    ---
    post:
        tags:
            - Utilisateurs
        summary: Créer un nouvel utilisateur
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.
        requestBody:
          description: Un objet JSON contenant les données du nouvel utilisateur
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                    - password
                    - confirm_password
                    - first_name
                    - last_name
                    - email
                properties:
                    password:
                        type: string
                        description: Doit contenir 8 charactères ou plus
                    confirm_password:
                        type: string
                    first_name:
                        type: string
                    last_name:
                        type: string
                    email:
                        type: string

        responses:
            200:
              description: L'utilisateur qui vient d'être créé
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/Utilisateur"
            400:
                description: Incorrect password matching
    """
    try:
        json = request.get_json()
        password = json.get('password', None)
        confirm_password = json.get('confirm_password', None)
        if not password or password != confirm_password:
            abort(400, dict(description="Incorrect password matching"))
        user = User.from_dict(json, create_admin=True)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/users', methods=['GET'])
@login_required
@admin_required
def fetch_users():
    """Obtenir tous les utilisateurs
    ---
    get:
        tags:
            - Utilisateurs
        summary: Obtenir tous les utilisateurs
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.


        responses:
            200:
              description: Une liste de tous les utilisateurs
              content:
                    application/json:
                        schema:
                            type: array
                            items:
                                $ref: "#/components/schemas/Utilisateur"
    """
    users = User.query.all()
    _list = [(user.id, remove_accent(user.last_name)) for user in users]
    _list.sort(key=lambda tup: tup[1])
    users = [User.query.filter_by(id=id).one() for id, _ in _list]
    return jsonify([user.to_dict() for user in users])


@api.route('/api/users/search', methods=['GET'])
@login_required
@admin_required
def search_users():
    """Obtenir des utilisateurs par recherche
    ---
    get:
        tags:
            - Utilisateurs
        summary: Obtenir des utilisateurs par recherche
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        parameters:
            - name: q
              in: query
              description: Le string de la recherche
              required: false
              schema:
                type: string
                default: ''

        responses:
            200:
              description: Une liste des 5 premiers utilisateurs correspondants à la recherche
              content:
                    application/json:
                        schema:
                            type: array
                            items:
                                $ref: "#/components/schemas/Utilisateur"
    """
    query_string = request.args.get('q', '')
    match_string = '%' + query_string + '%'
    # Get the first 5 users that have a first name, last name or
    # email matching the query string
    users = User.query.filter(
        User.first_name.ilike(match_string) |
        User.last_name.ilike(match_string) |
        User.email.ilike(match_string)
    ).limit(5).all()
    return jsonify(dict(results=[user.to_dict() for user in users]))


@api.route('/api/users/count', methods=['GET'])
@login_required
@admin_required
def count_users():
    """Nombre d'utilisateurs
    ---
    get:
        tags:
            - Utilisateurs
        summary: Nombre d'utilisateurs
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        responses:
            200:
              content:
                text/plain:
                    schema:
                        type: integer
    """
    return str(User.query.count())


@api.route('/api/users/me', methods=['GET'])
def read_me():
    """Obtenir son profil utilisateur
    ---
    get:
        tags:
            - Utilisateurs
        summary: Obtenir son profil utilisateur

        responses:
            200:
              description: Les données de l'utilisateur actuel incluant les applications dont il est propriétaire.
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/Utilisateur avec applications"
            404:
                description: L'utilisateur n'est pas authentifié
    """
    if not current_user.is_authenticated:
        # We prefer to use a 404 here instead of a 401 because on the frontend
        # - a 401 automatically redirects to the login page and
        # - this endpoint is called at the frontend initialization
        # which results in an infinite loop
        return abort(404)
    return jsonify(current_user.to_dict(populate_applications=True))


@api.route('/api/users/<user_id>', methods=['GET'])
@login_required
@admin_required
def read_user(user_id):
    """Obtenir les données d'un utilisateur
    ---
    get:
        tags:
            - Utilisateurs
        summary: Obtenir les données d'un utilisateur
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        parameters:
            - name: user_id
              in: path
              description: L'ID de l'utlisateur
              required: true
              schema:
                type: integer

        responses:
            200:
              description: L'utilisateur correspondant à l'ID
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/Utilisateur avec applications"
    """
    user = get_user(user_id)
    return jsonify(user.to_dict(populate_applications=True))


@api.route('/api/users/<user_id>', methods=['PUT'])
@login_required
@admin_required
def update_user(user_id):
    """Modifier les données d'un utilisateur
    ---
    put:
        tags:
            - Utilisateurs
        summary: Modifier les données d'un utilisateur
        description: L'authentification est requise.

        parameters:
            - name: user_id
              in: path
              description: L'ID de l'utlisateur
              required: true
              schema:
                type: integer

        requestBody:
          description: Un objet JSON contenant les données du nouvel utilisateur
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                    - first_name
                    - last_name
                    - email
                properties:
                    first_name:
                        type: string
                    last_name:
                        type: string
                    email:
                        type: string
                    is_admin:
                        type: boolean
                    ownedApplications:
                        type: array
                        items:
                            type: object
                            properties:
                                id:
                                    type: integer
                                    description: L'ID de l'application

        responses:
            200:
              description: L'utilisateur modifié
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/Utilisateur"
    """
    try:
        user = get_user(user_id)
        json = request.get_json()
        user.update_from_dict(json, Application.query, update_admin = True)
        db.session.commit()
        db.session.refresh(user)
        return jsonify(user.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/users/<user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    """Supprimer un utilisateur
    ---
    delete:
        tags:
            - Utilisateurs
        summary: Supprimer un utilisateur
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        parameters:
            - name: user_id
              in: path
              description: L'ID de l'utlisateur
              required: true
              schema:
                type: integer


        responses:
            200:
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/JsonResponse200"
    """
    user = get_user(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify(dict(description='OK', code=200))


def get_user(user_id):
    try:
        usr_id = int(user_id)
    except ValueError:
        raise BadRequest(f"Administrateur inconnu : {user_id}")
    return User.query.get_or_404(usr_id)


@api.route('/api/users/import', methods=['POST'])
@login_required
@admin_required
def import_users():
    """Importer les utilisateurs
    ---
    post:
        tags:
            - Utilisateurs
        summary: Importer les utilisateurs
        description: Tous les utilisateurs actuels sont remplacés par cet import. L'authentification est requise. L'utilisateur doit être administrateur principal.

        requestBody:
          description: Le CSV contenant les utilisateurs
          required: true
          content:
            application/csv:
              schema:
                $ref: "#/components/schemas/Utilisateur CSV"


        responses:
            200:
              content:
                    application/json:
                        schema:
                            $ref: "#/components/schemas/JsonResponse200"
    """
    try:
        import_resource(User)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@api.route('/api/users/export', methods=['GET'])
@login_required
@admin_required
def export_users():
    """Exporter les utilisateurs
    ---
    get:
        tags:
            - Utilisateurs
        summary: Exporter les utilisateurs
        description: L'authentification est requise. L'utilisateur doit être administrateur principal.

        responses:
            200:
              description: Le CSV contenant les utilisateurs
              content:
                    application/csv:
                        schema:
                            $ref: "#/components/schemas/Utilisateur CSV"
    """
    return export_resource(User, 'users.csv')
