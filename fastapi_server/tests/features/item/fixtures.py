from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import get_db
from app.features.item import api as item_api_module
from app.features.item.schema import Item, ItemResolution, ItemSummary
from tests.features.product.fixtures import (
    product_factory,
    product_summary_factory,
)


def item_factory() -> Item:
    return Item(
        product=product_factory(),
        quantity=2,
        price_cent=2000,
        on_sale=True,
    )


def item_summary_factory(
    product_id: int = 11,
    quantity: int = 2,
) -> ItemSummary:
    return ItemSummary(
        product_id=product_id,
        quantity=quantity,
    )


def item_resolution_factory(
    product_id: int = 11,
    quantity: int = 2,
) -> ItemResolution:
    unit_price = 2000
    return ItemResolution(
        product=product_summary_factory(product_id),
        quantity=quantity,
        unit_price_cent=unit_price,
        line_total_cent=unit_price * quantity,
        on_sale=True,
        warning=None,
    )


@pytest.fixture
def item_app(database, monkeypatch) -> FastAPI:
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
    application.include_router(item_api_module.items_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    return application


@pytest.fixture
def item_client(item_app: FastAPI):
    with TestClient(item_app) as test_client:
        yield test_client
