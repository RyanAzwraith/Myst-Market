from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import exception_handlers
from app.features.media import api as media_api_module
from app.features.media.schema import (
    EntityType,
    MediaDetail,
    MediaType,
)


def media_detail_factory(
    media_id: int = 9,
    entity_id: int = 11,
    entity_type: EntityType = EntityType.product,
    media_type: MediaType = MediaType.image,
    media_url: str | None = None,
) -> MediaDetail:
    media_url = media_url or (
        f"/media/{entity_type.value}/battle-axe.png"
    )
    return MediaDetail(
        id=media_id,
        media_type=media_type,
        media_url=media_url,
        entity_id=entity_id,
        entity_type=entity_type,
        alt_text="Battle axe",
        sort_order=1,
    )


@pytest.fixture
def media_file(tmp_path: Path) -> Path:
    path = tmp_path / "battle-axe.png"
    path.write_bytes(b"media contents")
    return path


@pytest.fixture
def media_app(media_system, monkeypatch) -> FastAPI:
    monkeypatch.setattr(
        exception_handlers,
        "get_logger",
        lambda: SimpleNamespace(
            api=SimpleNamespace(debug=lambda *args: None),
            app=SimpleNamespace(error=lambda *args: None),
        ),
    )
    monkeypatch.setattr(
        media_api_module,
        "get_media_system",
        lambda: media_system,
    )

    application = FastAPI()
    exception_handlers.init_exception_handlers(application)
    application.include_router(media_api_module.media_router)
    return application


@pytest.fixture
def media_client(media_app: FastAPI):
    with TestClient(media_app) as test_client:
        yield test_client
