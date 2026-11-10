from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api import middleware as middleware_module
from app.api.dependencies import get_db
from app.api.router import router
from types import SimpleNamespace


def credentials_factory(token: str = "token"):
    return SimpleNamespace(credentials=token)


@pytest.fixture
def exception_logger(monkeypatch):
    logger = SimpleNamespace(
        api=Mock(),
        app=Mock(),
        requests=Mock(),
    )
    monkeypatch.setattr(
        exception_handlers,
        "get_logger",
        lambda: logger,
    )
    return logger


@pytest.fixture
def exception_app(exception_logger) -> FastAPI:
    application = FastAPI()
    exception_handlers.init_exception_handlers(application)

    @application.get("/app-error")
    def app_error_route():
        from app.core.exceptions import AppError

        raise AppError("Application failed")

    @application.get("/app-exception")
    def app_exception_route():
        from app.core.exceptions import RequestException

        raise RequestException("Request failed")

    @application.get("/generic-error")
    def generic_error_route():
        raise RuntimeError("Unexpected failure")

    @application.get("/validation-error")
    def validation_error_route():
        from pydantic import BaseModel

        class RequiredModel(BaseModel):
            value: int

        RequiredModel.model_validate({})
        return None

    @application.get("/request-validation")
    def request_validation_route(value: int):
        return value

    return application


@pytest.fixture
def exception_client(exception_app: FastAPI):
    with TestClient(
        exception_app,
        raise_server_exceptions=False,
    ) as test_client:
        yield test_client


@pytest.fixture
def router_app(database) -> FastAPI:
    application = FastAPI()
    application.include_router(router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    return application


@pytest.fixture
def router_client(router_app: FastAPI):
    with TestClient(router_app) as test_client:
        yield test_client


@pytest.fixture
def middleware_logger(monkeypatch):
    logger = SimpleNamespace(requests=Mock())
    monkeypatch.setattr(
        middleware_module,
        "get_logger",
        lambda: logger,
    )
    return logger


@pytest.fixture
def middleware_app(middleware_logger) -> FastAPI:
    application = FastAPI()
    middleware_module.init_middleware(
        application,
        ["http://frontend.test"],
    )

    @application.post("/echo")
    async def echo_route():
        return {"ok": True}

    return application


@pytest.fixture
def middleware_client(middleware_app: FastAPI):
    with TestClient(middleware_app) as test_client:
        yield test_client
