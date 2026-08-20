from io import BytesIO
from types import SimpleNamespace

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.db.models import Media
from app.features.media import media_service


@pytest.fixture
def media_root(tmp_path, monkeypatch):
    config = SimpleNamespace(media_url=str(tmp_path))
    monkeypatch.setattr(media_service, "get_config", lambda: config)
    return tmp_path


@pytest.fixture
def media_factory(session, media_root):
    def create_media(
        *,
        entity_id,
        entity_type="product",
        file_name="media.jpg",
        media_type="image",
        alt_text=None,
        sort_order=0,
        content=b"media content",
    ):
        path = media_root / entity_type / file_name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

        media = Media(
            type=media_type,
            file_name=file_name,
            entity_id=entity_id,
            entity_type=entity_type,
            alt_text=alt_text,
            sort_order=sort_order,
        )
        session.add(media)
        session.commit()
        session.refresh(media)
        return media

    return create_media


@pytest.fixture
def product_media(product, media_factory):
    return media_factory(entity_id=product.id)


@pytest.fixture
def sale_media(sale, media_factory):
    return media_factory(
        entity_id=sale.id,
        entity_type="sale",
        file_name="sale.jpg",
    )


@pytest.fixture
def upload_file_factory(media_root):
    def create_upload(
        *,
        filename="upload.jpg",
        content_type="image/jpeg",
        content=b"uploaded media",
    ):
        return UploadFile(
            file=BytesIO(content),
            filename=filename,
            headers=Headers({"content-type": content_type}),
        )

    return create_upload
