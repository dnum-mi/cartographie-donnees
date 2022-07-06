import os

from app import app
from app.api import data_sources, applications, enumerations, auth, users


@app.route('/', defaults={'path': ''})
@app.route('/<string:path>')
@app.route('/admin/<string:path>')
@app.route('/admin/users/<string:path>')
@app.route('/admin/users/<string:path>/update')
@app.route('/application/<string:path>')
@app.route('/data-source/<string:path>')
@app.route('/admin/data-sources/<string:path>')
@app.route('/admin/data-sources/<string:path>/update')
@app.route('/admin/applications/<string:path>')
@app.route('/admin/applications/<string:path>/update')
@app.route('/reset-password/<string:path>')
def catch_all(path):
    static_file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(static_file_path):
        return app.send_static_file(path)
    return app.send_static_file('index.html')
