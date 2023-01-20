from flask import jsonify
from . import api
from .. import db


@api.errorhandler(400)
def bad_request_error(error):
    return jsonify({
        'code': 400,
        'description': error.description
    }), 400


@api.errorhandler(401)
def unauthenticated_error(error):
    return jsonify({
        'code': 401,
        'description': "Vous n'êtes pas authentifié",
    }), 401


@api.errorhandler(403)
def unauthorized_error(error):
    return jsonify({
        'code': 403,
        'description': "Vous n'êtes pas autorisé à accéder à cette page",
    }), 403


@api.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'code': 404,
        'description': 'Ressource introuvable'
    }), 404


@api.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'code': 500,
        'description': 'Erreur interne du serveur'
    }), 500
