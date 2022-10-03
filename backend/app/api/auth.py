from flask import abort, request, current_app, render_template
from flask_login import logout_user, login_user
import jwt
from datetime import datetime, timedelta
from app import login, db
from app.models import User
from . import api
from ..emails import send_email


@login.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@login.request_loader
def load_user_from_request(request):
    # Log in using a JWT token
    auth_header = request.headers.get('Authorization')
    if auth_header and 'Bearer' in auth_header:
        token = auth_header.replace('Bearer ', '', 1)
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.InvalidTokenError as e:
            # Signature has probably expired
            return None
        user = User.query.filter_by(email=data['sub']).first()
        if user:
            return user
    return None


@api.route('/api/login', methods=['POST'])
def login():
    req = request.get_json(force=True)
    email = req.get('email', None)
    password = req.get('password', None)
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        abort(401)
    login_user(user)
    token = jwt.encode({
        'sub': user.email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'])
    ret = {'token': token}
    return ret, 200


@api.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return 'ok'


@api.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    host = current_app.config['FRONTEND_HOST'] or request.host_url
    url = host + 'reset-password/'
    body = request.get_json()
    email = body.get('email')
    if not email:
        abort(400)
    user = User.query.filter_by(email=email).first_or_404()
    token = jwt.encode({
        'sub': user.email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'])
    send_email('[Cartographie] Réinitialisation de votre mot de passe',
               recipients=[user.email],
               text_body=render_template('reset_password.txt', url=url + token),
               html_body=render_template('reset_password.html', url=url + token))
    return 'ok'


@api.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    body = request.get_json()
    password = body.get('password')
    token = body.get('token')
    if not password or not token or len(password) < 8:
        abort(400)
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
    except jwt.InvalidTokenError as e:
        # Signature has probably expired
        abort(400)
    user = User.query.filter_by(email=data['sub']).first_or_404()
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return 'ok'

