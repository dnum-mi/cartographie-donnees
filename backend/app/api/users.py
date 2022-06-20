from werkzeug.exceptions import BadRequest
from flask import jsonify, request, abort
from flask_login import login_required, current_user

from app import db
from app.models import User
from app.decorators import admin_required
from app.exceptions import CSVFormatError
from app.api.commons import import_resource, export_resource
from app.search import remove_accent

from . import api


@api.route('/api/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    try:
        json = request.get_json()
        password = json.get('password', None)
        confirm_password = json.get('confirm_password', None)
        if not password or password != confirm_password:
            abort(400, dict(description="Incorrect password matching"))
        user = User.from_dict(json)
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
    users = User.query.all()
    _list = [(user.id, remove_accent(user.last_name)) for user in users]
    _list.sort(key=lambda tup: tup[1])
    users = [User.query.filter_by(id=id).one() for id, _ in _list]
    return jsonify([user.to_dict() for user in users])


@api.route('/api/users/search', methods=['GET'])
@login_required
@admin_required
def search_users():
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

@login_required
@admin_required
@api.route('/api/users/count', methods=['GET'])
def count_users():
    if current_user.is_admin:
        return str(User.query.count())
    else:
        return '0'

@api.route('/api/users/me', methods=['GET'])
def read_me():
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
    user = get_user(user_id)
    return jsonify(user.to_dict(populate_applications=True))


@api.route('/api/users/<user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    try:
        user = get_user(user_id)
        json = request.get_json()
        user.update_from_dict(json)
        db.session.commit()
        db.session.refresh(user)
        return jsonify(user.to_dict())
    except Exception as e:
        raise BadRequest(str(e))


@api.route('/api/users/<user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    user = get_user(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify(dict(description='OK', code=200))


def get_user(user_id):
    try:
        usr_id = int(user_id)
    except ValueError:
        raise BadRequest(f"Utilisateur inconnu : {user_id}")
    return User.query.get_or_404(usr_id)


@api.route('/api/users/import', methods=['POST'])
@login_required
@admin_required
def import_users():
    try:
        import_resource(User)
    except CSVFormatError as e:
        raise BadRequest(e.message)
    return jsonify(dict(description='OK', code=200))


@api.route('/api/users/export', methods=['GET'])
@login_required
@admin_required
def export_users():
    return export_resource(User, 'users.csv')
