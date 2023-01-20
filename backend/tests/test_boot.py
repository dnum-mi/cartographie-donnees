def test_app_serves_static_files(client):
    response = client.get("/favicon.ico")
    assert response.status_code == 200
