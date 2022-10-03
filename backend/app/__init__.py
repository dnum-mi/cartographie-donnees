import os
import logging
from config import Config
from logging.handlers import RotatingFileHandler
from elasticsearch import Elasticsearch
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_mail import Mail
from flask_redoc import Redoc

from .staging_auth import BasicAuth


db = SQLAlchemy()
migrate = Migrate()
basic_auth = BasicAuth()
login = LoginManager()
mail = Mail()


def create_app(testing=False):
    app = Flask(__name__, static_folder='../build', static_url_path='/')
    app.config.from_object(Config)
    if testing:
        app.config['TESTING'] = True

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    basic_auth.init_app(app)
    app.elasticsearch = Elasticsearch([app.config['ELASTICSEARCH_URL']]) if app.config['ELASTICSEARCH_URL'] else None
    login.init_app(app)
    mail.init_app(app)
    redoc = Redoc(app, 'openapi.yml')

    if not app.debug and not app.testing:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/backend.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info('Backend startup')

    from app import models

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint)

    from .cli import cli as cli_blueprint
    app.register_blueprint(cli_blueprint)

    return app
