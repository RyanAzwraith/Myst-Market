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
    get_optional_user,
)
from app.features.order import api as order_api_module
from app.features.order import service as order_service
from app.features.order.schema import (
    Address,
    AdminSearchParams,
    AdminSort,
    Order,
    OrderSummary,
    Status,
)
from tests.features.item.fixtures import item_resolution_factory
from tests.features.user.fixtures import (
    admin_user_factory,
    user_factory,
)


def address_factory() -> Address:
    return Address(
        country_code="AU",
        postcode="3000",
        state="VIC",
        city="Melbourne",
        street="1 Test Street",
    )


def order_factory(
    order_id: int = 12,
    user_id: int = 8,
    status: Status = Status.pending,
) -> Order:
    items = [item_resolution_factory()]
    return Order(
        id=order_id,
        user_id=user_id,
        address_string="1 Test Street, Melbourne, VIC, 3000, AU",
        items=items,
        cost_aud_cent=4000,
        created_at=date(2026, 1, 6),
        status=status,
    )


def order_summary_factory(order_id: int = 12) -> OrderSummary:
    return OrderSummary(
        id=order_id,
        created_at=date(2026, 1, 6),
        total_cent=4000,
        status=Status.pending,
    )


def admin_search_params_factory() -> AdminSearchParams:
    return AdminSearchParams(
        search_name="Test User",
        status=[Status.pending, Status.processing],
        sort=AdminSort.cost,
        is_ascending=False,
    )


def stripe_session_factory(
    order_id: int = 12,
    payment_intent: str = "pi_test_123",
):
    class StripeSession(dict):
        @property
        def payment_intent(self):
            return payment_intent

    return StripeSession(
        metadata={"order_id": str(order_id)},
    )


@pytest.fixture
def configured_order(monkeypatch):
    config = SimpleNamespace(
        cors_origins=["http://localhost:5173"],
        stripe_payment_hook_key="webhook-secret",
    )
    monkeypatch.setattr(order_service, "get_config", lambda: config)
    monkeypatch.setattr(order_api_module, "get_config", lambda: config)
    return config


@pytest.fixture
def order_app(database, configured_order, monkeypatch) -> FastAPI:
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
    application.include_router(order_api_module.orders_router)
    application.include_router(order_api_module.order_router)
    application.include_router(order_api_module.stripe_router)

    current_user = user_factory(user_id=8)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_current_user] = (
        lambda: current_user
    )
    application.dependency_overrides[get_admin_user] = admin_user_factory
    application.dependency_overrides[get_optional_user] = lambda: None
    return application


@pytest.fixture
def order_client(order_app: FastAPI):
    with TestClient(order_app) as test_client:
        yield test_client
