
import importlib
import os
from unittest.mock import MagicMock, patch

os.environ["ENVIRONMENT"] = "test"

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

pytest_plugins = (
    "tests.features.user.fixtures",
    "tests.features.auth.fixtures",
    "tests.features.sale.fixtures",
    "tests.features.product.fixtures",
    "tests.features.review.fixtures",
    "tests.features.item.fixtures",
    "tests.features.order.fixtures",
    "tests.features.media.fixtures",
    "tests.features.app.fixtures",
    "tests.api.fixtures",
    "tests.core.fixtures",
    "tests.create_app.fixtures",
    "tests.implementations.media_system.fixtures",
    "tests.implementations.database.sqlite.fixtures",
)

from app.api.dependencies import get_db
from app.interfaces.database import Database
from app.interfaces.media_system import MediaSystem


@pytest.fixture
def database():
    db = MagicMock(spec=Database)
    db.engine = MagicMock()
    db.media = MagicMock()

    def session_factory():
        yield MagicMock(name="database_session")

    db.session_factory.side_effect = session_factory
    db.with_session.return_value = db

    return db


@pytest.fixture
def media_system():
    return MagicMock(spec=MediaSystem)


@pytest.fixture
def app(database, media_system) -> FastAPI:
    create_app_module = importlib.import_module("app.create_app")
    media_api_module = importlib.import_module(
        "app.features.media.api"
    )

    with (
        patch.object(
            create_app_module,
            "init_database",
            return_value=database,
        ),
        patch.object(
            create_app_module,
            "init_media_system",
            return_value=media_system,
        ),
        patch.object(
            media_api_module,
            "get_media_system",
            return_value=media_system,
        ),
    ):
        application = create_app_module.create_app()

        def override_get_db():
            yield database

        application.dependency_overrides[get_db] = override_get_db

        try:
            yield application
        finally:
            application.dependency_overrides.clear()


@pytest.fixture
def client(app: FastAPI):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def mock_external_services(monkeypatch):
    monkeypatch.setattr(
        "resend.Emails.send",
        lambda *args, **kwargs: None,
    )
