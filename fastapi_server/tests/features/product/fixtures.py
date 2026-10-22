from datetime import date
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import (
    get_admin_user,
    get_db,
    get_optional_user,
)
from app.features.product import api as product_api_module
from app.features.sale.schema import SaleSummary
from app.features.product.schema import (
    AdminSearchParams,
    AdminSort,
    Category,
    Product,
    ProductAnalytics,
    ProductFields,
    ProductSummary,
    Rarity,
    SearchParams,
    Sort,
)
from tests.features.user.fixtures import admin_user_factory


def product_fields_factory() -> ProductFields:
    return ProductFields(
        name="Battle Axe",
        category_name="weapons",
        rarity_name="rare",
        price_aud_cent=2500,
        slug="battle-axe",
        description="A reliable battle axe",
        stock=8,
    )


def product_factory(
    product_id: int = 11,
    sale: SaleSummary | None = None,
) -> Product:
    fields = product_fields_factory()
    return Product(
        **fields.model_dump(),
        id=product_id,
        discounted_price=2000 if sale else None,
        sale=sale,
    )


def product_summary_factory(product_id: int = 11) -> ProductSummary:
    return ProductSummary(
        id=product_id,
        sale_id=None,
        name="Battle Axe",
        slug="battle-axe",
    )


def product_analytics_factory(product_id: int = 11) -> ProductAnalytics:
    product = product_factory(product_id=product_id)
    return ProductAnalytics(
        **product.model_dump(),
        discontinued_at=None,
        created_at=date(2026, 1, 4),
        units_sold=12,
        revenue=30000,
        order_count=10,
        refunds=1,
        revenue_lost=500,
        average_rating=4.5,
        reviews=6,
    )


def search_params_factory() -> SearchParams:
    return SearchParams(
        categories=[Category.weapons],
        rarities=[Rarity.rare],
        sort=Sort.price,
        is_ascending=True,
        search="axe",
    )


def admin_search_params_factory() -> AdminSearchParams:
    return AdminSearchParams(
        categories=[Category.weapons],
        rarities=[Rarity.rare],
        search="axe",
        is_discontinued=False,
        sort=AdminSort.revenue,
        is_ascending=False,
    )

@pytest.fixture
def product_app(database, monkeypatch) -> FastAPI:
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
    application.include_router(product_api_module.product_router)
    application.include_router(product_api_module.products_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_admin_user] = admin_user_factory
    application.dependency_overrides[get_optional_user] = lambda: None
    return application


@pytest.fixture
def product_client(product_app: FastAPI):
    with TestClient(product_app) as test_client:
        yield test_client
