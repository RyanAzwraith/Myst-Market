from datetime import date
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import (
    get_admin_user,
    get_current_user,
    get_db,
    get_set_password_user,
)
from app.features.user import api as user_api_module
from app.features.user import service as user_service
from app.features.user.schema import (
    AdminSearchParams,
    AdminSort,
    Registration,
    User,
    UserAnalytics,
    UserInput,
    UserPatch,
)


def user_factory(
    user_id: int = 7,
    email: str = "user@example.com",
    name: str = "Test User",
    is_admin: bool = False,
    is_registered: bool = True,
) -> User:
    return User(
        id=user_id,
        email=email,
        name=name,
        is_admin=is_admin,
        is_registered=is_registered,
    )


def user_record_factory(
    user_id: int = 7,
    email: str = "user@example.com",
    name: str = "Test User",
    is_admin: bool = False,
    is_registered: bool = True,
    password_hash: str | None = "stored-password-hash",
):
    return SimpleNamespace(
        id=user_id,
        email=email,
        name=name,
        is_admin=is_admin,
        is_registered=is_registered,
        password_hash=password_hash,
    )


def user_input_factory(
    email: str = "new-user@example.com",
    name: str = "New User",
) -> UserInput:
    return UserInput(email=email, name=name)


def user_patch_factory(
    email: str | None = "updated@example.com",
    name: str | None = "Updated User",
) -> UserPatch:
    return UserPatch(email=email, name=name)


def admin_user_factory() -> User:
    return user_factory(
        user_id=7,
        email="admin@example.com",
        name="Admin User",
        is_admin=True,
    )


def current_user_factory() -> User:
    return user_factory(user_id=8)


def user_analytics_factory(
    user_id: int = 7,
    email: str = "user@example.com",
    name: str = "Test User",
) -> UserAnalytics:
    return UserAnalytics(
        id=user_id,
        email=email,
        name=name,
        is_registered=True,
        created_at=date(2026, 1, 2),
        deleted_at=None,
        order_count=3,
        spent=4500,
        revenue_lost=0,
        review_count=2,
    )


def admin_search_params_factory() -> AdminSearchParams:
    return AdminSearchParams(
        is_ascending=False,
        sort_by=AdminSort.alphabet,
        search="test",
        registration=[
            Registration.registered,
            Registration.guest,
        ],
    )


@pytest.fixture
def configured_user(monkeypatch):
    config = SimpleNamespace(
        cors_origins=["http://localhost:5173"],
    )
    monkeypatch.setattr(user_service, "get_config", lambda: config)
    return config


@pytest.fixture
def user_app(database, monkeypatch) -> FastAPI:
    monkeypatch.setattr(
        exception_handlers,
        "get_logger",
        lambda: SimpleNamespace(
            api=SimpleNamespace(debug=lambda *args: None),
            app=SimpleNamespace(error=lambda *args: None),
        ),
    )

    current_user = user_record_factory()
    admin_user = user_record_factory(is_admin=True)
    set_password_user = user_record_factory()

    application = FastAPI()
    exception_handlers.init_exception_handlers(application)
    application.include_router(user_api_module.user_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_current_user] = (
        lambda: current_user
    )
    application.dependency_overrides[get_admin_user] = lambda: admin_user
    application.dependency_overrides[get_set_password_user] = (
        lambda: set_password_user
    )
    return application


@pytest.fixture
def user_client(user_app: FastAPI):
    with TestClient(user_app) as test_client:
        yield test_client
