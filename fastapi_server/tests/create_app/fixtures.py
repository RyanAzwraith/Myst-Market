from types import SimpleNamespace
from unittest.mock import MagicMock, Mock

import importlib
import pytest
from fastapi import FastAPI

from tests.core.fixtures import config_factory


@pytest.fixture
def create_app_module():
    return importlib.import_module("app.create_app")


@pytest.fixture
def configured_create_app(
    create_app_module,
    database,
    media_system,
    monkeypatch,
):
    config = config_factory(
        stripe_key="stripe-test-key",
        resend_key="resend-test-key",
        cors_origins=["http://frontend.test"],
    )
    session = object()
    session_generator = MagicMock()
    session_generator.__next__.return_value = session
    database.session_factory.side_effect = None
    database.session_factory.return_value = session_generator
    database.with_session.return_value = database

    init_config = Mock(return_value=config)
    init_logger = Mock()
    init_media_system = Mock(return_value=media_system)
    init_database = Mock(return_value=database)
    init_middleware = Mock()
    init_exception_handlers = Mock()

    monkeypatch.setattr(
        create_app_module,
        "init_config",
        init_config,
    )
    monkeypatch.setattr(
        create_app_module,
        "init_logger",
        init_logger,
    )
    monkeypatch.setattr(
        create_app_module,
        "init_media_system",
        init_media_system,
    )
    monkeypatch.setattr(
        create_app_module,
        "init_database",
        init_database,
    )
    monkeypatch.setattr(
        create_app_module,
        "init_middleware",
        init_middleware,
    )
    monkeypatch.setattr(
        create_app_module,
        "init_exception_handlers",
        init_exception_handlers,
    )

    return SimpleNamespace(
        config=config,
        database=database,
        media_system=media_system,
        session_generator=session_generator,
        init_config=init_config,
        init_logger=init_logger,
        init_media_system=init_media_system,
        init_database=init_database,
        init_middleware=init_middleware,
        init_exception_handlers=init_exception_handlers,
    )
