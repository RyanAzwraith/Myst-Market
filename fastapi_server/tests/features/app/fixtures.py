from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import get_admin_user, get_db
from app.features.app import api as app_api_module
from app.features.app.schema import (
    Attention,
    Graph,
    GraphPoint,
    Performance,
    Stats,
)
from tests.features.user.fixtures import admin_user_factory


def stats_factory() -> Stats:
    return Stats(
        product_count=24,
        customer_count=18,
        total_average_rating=4.25,
    )


def attention_factory() -> Attention:
    return Attention(
        pending_orders=5,
        out_of_stock_products=3,
        sales_ending=2,
    )


def graph_point_factory(
    month: str = "2026-01",
    revenue: int = 12000,
    orders: int = 6,
) -> GraphPoint:
    return GraphPoint(
        month=month,
        revenue=revenue,
        orders=orders,
    )


def graph_factory() -> Graph:
    return Graph(
        points=[
            graph_point_factory(),
            graph_point_factory(
                month="2026-02",
                revenue=15000,
                orders=8,
            ),
        ],
    )


def performance_factory(period_days: int = 30) -> Performance:
    return Performance(
        period_days=period_days,
        revenue=50000,
        orders=25,
        new_customers=10,
        revenue_lost=3000,
        previous_revenue=42000,
        previous_orders=21,
        previous_new_customers=8,
        previous_revenue_lost=2500,
    )


@pytest.fixture
def app_feature_app(database, monkeypatch) -> FastAPI:
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
    application.include_router(app_api_module.app_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_admin_user] = admin_user_factory
    return application


@pytest.fixture
def app_feature_client(app_feature_app: FastAPI):
    with TestClient(app_feature_app) as test_client:
        yield test_client
