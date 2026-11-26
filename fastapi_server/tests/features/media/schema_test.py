import pytest
from pydantic import ValidationError

from app.features.media.schema import (
    EntityType,
    MediaDetail,
    MediaType,
)
from tests.features.media.fixtures import media_detail_factory


@pytest.mark.low
class MediaDetailSchema_test:
    def functionality_test(self):
        media = media_detail_factory()

        assert media.id == 9
        assert media.media_type is MediaType.image
        assert media.entity_type is EntityType.product
        assert media.media_url == "/media/product/battle-axe.png"

    def permits_optional_metadata_test(self):
        media = media_detail_factory()
        media = media.model_copy(
            update={
                "alt_text": None,
                "sort_order": None,
            },
        )

        assert media.alt_text is None
        assert media.sort_order is None

    def requires_media_detail_fields_test(self):
        with pytest.raises(ValidationError):
            MediaDetail.model_validate({})


@pytest.mark.low
class MediaTypeSchema_test:
    def functionality_test(self):
        assert MediaType.image.value == "image"
        assert MediaType.video.value == "video"

    def rejects_unknown_media_type_test(self):
        with pytest.raises(ValidationError):
            MediaDetail.model_validate(
                {
                    **media_detail_factory().model_dump(),
                    "media_type": "audio",
                },
            )


@pytest.mark.low
class EntityTypeSchema_test:
    def functionality_test(self):
        assert EntityType.product.value == "product"
        assert EntityType.sale.value == "sale"

    def rejects_unknown_entity_type_test(self):
        with pytest.raises(ValidationError):
            MediaDetail.model_validate(
                {
                    **media_detail_factory().model_dump(),
                    "entity_type": "user",
                },
            )
