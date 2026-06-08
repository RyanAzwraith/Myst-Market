from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {'message': 'Myst Market API running with DB'}

# python -m pytest
#   - runs tests