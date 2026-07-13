import pytest
from fastapi.testclient import TestClient
import os

from app.create_app import create_app
from app.db.database import Base
from app.api.dependencies import get_session

from tests.user_feature.user_fixtures import *
from tests.shop_feature.shop_fixtures import *

def pytest_configure():
    os.environ["ENVIRONMENT"] = "test"

@pytest.fixture(scope="session", autouse=True)
def app():
    app = create_app()
    db=app.state.db
    
    Base.metadata.drop_all(db.engine)
    Base.metadata.create_all(db.engine)
    
    yield app

    Base.metadata.drop_all(db.engine)

@pytest.fixture(scope="session")
def client(app):
    yield TestClient(app)

@pytest.fixture()
def session(app):
    connection = app.state.db.engine.connect()
    transaction = connection.begin()

    session = app.state.db.make_session(bind=connection)
    app.dependency_overrides[get_session] = lambda: session

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
        app.dependency_overrides.clear()

@pytest.fixture(scope="class")
def persistant_session(app):
    connection = app.state.db.engine.connect()
    transaction = connection.begin()

    session = app.state.db.make_session(bind=connection)
    app.dependency_overrides[get_session] = lambda: session

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
        app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def mock_external_services(monkeypatch):
    monkeypatch.setattr("resend.Emails.send", lambda *a, **k: None)