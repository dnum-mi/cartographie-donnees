from flask import jsonify
from app import app, db


@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({
        'code': 400,
        'description': error.description
    }), 400


@app.errorhandler(401)
def unauthenticated_error(error):
    return jsonify({
        'code': 401,
        'description': "Vous n'êtes pas authentifié",
    }), 401


@app.errorhandler(403)
def unauthorized_error(error):
    return jsonify({
        'code': 403,
        'description': "Vous n'êtes pas autorisé à accéder à cette page",
    }), 403


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'code': 404,
        'description': 'Ressource introuvable'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'code': 500,
        'description': 'Erreur interne du serveur'
    }), 500
