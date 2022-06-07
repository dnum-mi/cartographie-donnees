import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL') or 'http://localhost:9200'
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG') or False
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or "localhost"
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or "no-reply@interieur.gouv.fr"
    FRONTEND_HOST = os.environ.get('FRONTEND_HOST')
    # SQLALCHEMY_ECHO = True if os.environ.get('SQLALCHEMY_ECHO') == "1" else False
    BASIC_AUTH_FORCE = os.environ.get('BASIC_AUTH_FORCE') == 'True' or False
    BASIC_AUTH_USERNAME = os.environ.get('BASIC_AUTH_USERNAME', 'admin')
    BASIC_AUTH_PASSWORD = os.environ.get('BASIC_AUTH_PASSWORD', 'admin')
