from flask import Blueprint

cli = Blueprint('cli', __name__)

from . import db
