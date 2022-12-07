from functools import wraps
from flask import abort
from flask_login import current_user
from app import db
from app.models import ownerships, DataSource, Application
from flask import request


def admin_required(func):
    """
    If you decorate a view with this, it will ensure that the current user
    has the administrator privilege before calling the actual view.
    Always use @login_required before this decorator.
    (If they are not, it returns a 403 status code.)
    """
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return func(*args, **kwargs)
    return decorated_view


def admin_or_owner_required(func):
    """
    If you decorate a view with this, it will ensure that the current user
    has the administrator privilege OR that he / she owns the application defined by
    an <application_id> OR that he / she owns the application of the data source defined
    by <data_source_id>.
    (If they are not, it returns a 403 status code.)
    Always use @login_required before this decorator.
    An <application_id> is needed in the URL to select the right application.
    """
    @wraps(func)
    def decorated_view(*args, **kwargs):
        application_id = None
        json = request.get_json()

        if "data_source_id" in kwargs:
            data_source = DataSource.query.get(kwargs['data_source_id'])
            application_id = data_source.application.id
        elif "application_id" in kwargs:
            application_id = kwargs['application_id']
        elif json is not None and 'application' in json and 'name' in json['application']:
            application = Application.query.filter_by(name=json.get("application").get("name")).first()
            application_id = application.id
        else:
            abort(500, "Use of admin_or_owner_required on a route without an "
                       "<application_id> or a <data_source_id> URL parameter or without json containing application "
                       "name")
        ownership = db.session.query(ownerships).filter_by(
            application_id=application_id,
            user_id=current_user.id
        ).first()
        if not current_user.is_admin and ownership is None:
            abort(403)
        return func(*args, **kwargs)
    return decorated_view
