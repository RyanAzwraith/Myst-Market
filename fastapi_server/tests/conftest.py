import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from app.create_app import create_app
from app.db.database import Base
from app.db.seeds.base_seed import base_seed
from app.db.seeds.dev_seed import dev_seed
from app.api.dependencies import get_session

def pytest_configure():
    os.environ["ENVIRONMENT"] = "test"

def create_dependency_override_get_session(app):
    def test_get_session():
        db = app.state.db
        session = db.make_session()
        try:
            yield session
        finally:
            session.rollback()
            session.close()
    return test_get_session

@pytest.fixture(scope="session", autouse=True)
def app():
    app = create_app()
    db=app.state.db
    Base.metadata.drop_all(db.engine)
    db.engine.dispose()
    Base.metadata.create_all(db.engine)
    
    session = db.get_session()
    base_seed(session)
    dev_seed(session)
    
    app.dependency_overrides[get_session] = db_session

    yield app

    app.dependency_overrides.clear()
    Base.metadata.drop_all(db.engine)
    db.engine.dispose()

@pytest.fixture(scope="session")
def client(app):
    yield TestClient(app)

@pytest.fixture()
def db_session(app):
    db = app.state.db
    session = db.make_session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture(autouse=True)
def mock_external_services(monkeypatch):
    monkeypatch.setattr("resend.Emails.send", lambda *a, **k: None)