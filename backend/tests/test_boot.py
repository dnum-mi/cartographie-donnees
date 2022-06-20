def test_request_example(client):
    response = client.get("/favicon.ico")
    assert response.status_code == 200
