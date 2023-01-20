from datetime import datetime, timedelta

import jwt

from tests.constants import ADMIN_CREDENTIALS


def test_login(client, admin_user):
    response = client.post("/api/login", json=ADMIN_CREDENTIALS)
    assert response.status_code == 200
    assert 'token' in response.json


def test_logout(client, admin_user):
    response = client.post("/api/logout")
    assert response.status_code == 200
    assert response.data.decode("utf-8") == 'ok'


def test_reset_password_without_email(client, admin_user):
    response = client.post("/api/auth/forgot-password", json={})
    assert response.status_code == 400


def test_reset_password_with_email_unkown(client, admin_user):
    response = client.post("/api/auth/forgot-password", json={'email': 'unknown'})
    assert response.status_code == 404


def send_email_mock(subject, recipients, text_body, html_body):
    pass


def test_forgot_password_success(monkeypatch, client, admin_user):
    monkeypatch.setattr("app.emails.send_email", send_email_mock)
    response = client.post("/api/auth/forgot-password", json={'email': 'admin@default.com'})
    assert response.status_code == 200


def generate_token(testing_app, admin_user):
    return jwt.encode({
        'sub': admin_user.email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, testing_app.config['SECRET_KEY'])


def test_reset_password_password_too_short(testing_app, client, admin_user):
    token = generate_token(testing_app, admin_user)
    response = client.post("/api/auth/reset-password", json={
        'password': 'newpass',
        'token': token,
    })
    assert response.status_code == 400


def test_reset_password_invalid_token(testing_app, client, admin_user):
    response = client.post("/api/auth/reset-password", json={
        'password': 'newpass',
        'token': 'invalid',
    })
    assert response.status_code == 400


def test_reset_password_success(testing_app, client, admin_user):
    token = generate_token(testing_app, admin_user)
    new_password = 'new_password'
    response = client.post("/api/auth/reset-password", json={
        'password': new_password,
        'token': token,
    })
    assert response.status_code == 200
    response = client.post("/api/login", json=ADMIN_CREDENTIALS)
    assert response.status_code == 401
    response = client.post("/api/login", json={**ADMIN_CREDENTIALS, 'password': new_password})
    assert response.status_code == 200
    assert 'token' in response.json
