from types import SimpleNamespace

import pytest

from app.features.media.schema import EntityType
from app.implementations.media_system.root_folder import RootFolder


def root_folder_factory(tmp_path) -> RootFolder:
    return RootFolder(tmp_path)


def media_record_factory(
    entity_type: EntityType = EntityType.product,
    media_url: str = "/media/product/kept.png",
):
    return SimpleNamespace(
        entity_type=entity_type,
        media_url=media_url,
    )


@pytest.fixture
def root_folder(tmp_path):
    return root_folder_factory(tmp_path)
