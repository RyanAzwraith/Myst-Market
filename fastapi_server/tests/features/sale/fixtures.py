from datetime import date
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import get_admin_user, get_db
from app.features.sale import api as sale_api_module
from app.features.sale.schema import (
    Activation,
    AdminSearchParams,
    AdminSort,
    Sale,
    SaleAnalytics,
    SaleInput,
    SaleSummary,
)
from tests.features.user.fixtures import admin_user_factory


def sale_summary_factory() -> SaleSummary:
    return SaleSummary(
        name="Summer Sale",
        slug="summer-sale",
        discount_perc=20,
    )


def sale_factory(
    sale_id: int = 4,
    name: str = "Summer Sale",
    slug: str = "summer-sale",
    discount_perc: int = 20,
) -> Sale:
    return Sale(
        id=sale_id,
        name=name,
        slug=slug,
        discount_perc=discount_perc,
        description="A seasonal sale",
        start_at=date(2026, 6, 1),
        end_at=date(2026, 6, 30),
    )


def sale_input_factory() -> SaleInput:
    return SaleInput(
        name="Winter Sale",
        slug="winter-sale",
        discount_perc=25,
        description="A winter sale",
        start_at=date(2026, 7, 1),
        end_at=date(2026, 7, 31),
    )


def sale_analytics_factory(sale_id: int = 4) -> SaleAnalytics:
    sale = sale_factory(sale_id=sale_id)
    return SaleAnalytics(
        **sale.model_dump(),
        revenue=5000,
        order_count=8,
        revenue_lost=250,
    )


def admin_search_params_factory() -> AdminSearchParams:
    return AdminSearchParams(
        activation=[
            Activation.active,
            Activation.upcoming,
        ],
        is_ascending=False,
        sort=AdminSort.discount_perc,
        search="summer",
    )

@pytest.fixture
def sale_app(database, monkeypatch) -> FastAPI:
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
    application.include_router(sale_api_module.sale_router)
    application.include_router(sale_api_module.sales_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_admin_user] = admin_user_factory
    return application


@pytest.fixture
def sale_client(sale_app: FastAPI):
    with TestClient(sale_app) as test_client:
        yield test_client
