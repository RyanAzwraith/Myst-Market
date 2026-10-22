from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.dependencies import get_db
from app.api import exception_handlers
from app.features.auth import api as auth_api_module
from app.features.auth.schema import Login
from app.features.auth import service as auth_service
from tests.features.user.fixtures import user_record_factory


def auth_config_factory(**overrides):
    values = {
        "environment": "test",
        "jwt_key": "test-jwt-key-with-at-least-32-bytes",
        "token_algorithm": "HS256",
        "access_token_minutes": 15,
        "refresh_token_hours": 12,
        "cors_origins": ["http://localhost:5173"],
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def login_factory(
    email: str = "user@example.com",
    password: str = "correct-password",
) -> Login:
    return Login(email=email, password=password)


@pytest.fixture
def configured_auth(monkeypatch):
    config = auth_config_factory()
    monkeypatch.setattr(auth_service, "get_config", lambda: config)
    return config


@pytest.fixture
def auth_app(database, configured_auth, monkeypatch) -> FastAPI:
    monkeypatch.setattr(
        exception_handlers,
        "get_logger",
        lambda: SimpleNamespace(
            api=SimpleNamespace(debug=lambda *args: None),
            app=SimpleNamespace(error=lambda *args: None),
        ),
    )

    application = FastAPI()
    exception_handlers.init_exception_handlers(application)
    application.include_router(auth_api_module.auth_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    return application


@pytest.fixture
def auth_client(auth_app: FastAPI):
    with TestClient(auth_app) as test_client:
        yield test_client
