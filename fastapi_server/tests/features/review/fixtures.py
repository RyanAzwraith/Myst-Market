from datetime import date
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.api.dependencies import get_current_user, get_db
from app.features.review import api as review_api_module
from app.features.review.schema import Review, ReviewInput
from tests.features.user.fixtures import current_user_factory


def review_factory(
    review_id: int = 4,
    product_id: int = 11,
    description: str | None = "Excellent product",
) -> Review:
    return Review(
        id=review_id,
        user_name="Test User",
        product_id=product_id,
        product_slug="battle-axe",
        created_at=date(2026, 1, 5),
        rating=5,
        description=description,
    )


def review_input_factory(
    product_id: int = 11,
    rating: int = 5,
    description: str | None = "Excellent product",
) -> ReviewInput:
    return ReviewInput(
        product_id=product_id,
        rating=rating,
        description=description,
    )


def review_result_factory():
    return SimpleNamespace(
        reviews=[review_factory()],
        average=4.5,
        user_has_review=False,
    )


@pytest.fixture
def review_app(database, monkeypatch) -> FastAPI:
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
    application.include_router(review_api_module.review_router)
    application.include_router(review_api_module.reviews_router)

    def override_get_db():
        yield database

    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_current_user] = (
        current_user_factory
    )
    return application


@pytest.fixture
def review_client(review_app: FastAPI):
    with TestClient(review_app) as test_client:
        yield test_client
