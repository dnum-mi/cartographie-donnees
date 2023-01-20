import os

from flask import Blueprint, current_app

main = Blueprint('main', __name__)


@main.route('/', defaults={'path': ''})
@main.route('/<string:path>')
@main.route('/admin/<string:path>')
@main.route('/admin/users/<string:path>')
@main.route('/admin/users/<string:path>/update')
@main.route('/application/<string:path>')
@main.route('/data-source/<string:path>')
@main.route('/admin/data-sources/<string:path>')
@main.route('/admin/data-sources/<string:path>/update')
@main.route('/admin/applications/<string:path>')
@main.route('/admin/applications/<string:path>/update')
@main.route('/reset-password/<string:path>')
def catch_all(path):
    static_file_path = os.path.join(current_app.static_folder, path)
    if os.path.isfile(static_file_path):
        return current_app.send_static_file(path)
    return current_app.send_static_file('index.html')
