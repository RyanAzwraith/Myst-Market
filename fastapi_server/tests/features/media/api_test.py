from pathlib import Path

import pytest

from app.core.exceptions import ContentNotFoundException
from tests.utils import assert_error_response


@pytest.mark.medium
class GetMediaFileRoute_test:
    def functionality_test(
        self,
        media_client,
        media_file: Path,
        media_system,
    ):
        media_system.get.return_value = (media_file, "image/png")

        response = media_client.get(
            "/media/product/battle-axe.png"
        )

        assert response.status_code == 200
        assert response.content == b"media contents"
        assert response.headers["content-type"] == "image/png"
        media_system.get.assert_called_once_with(
            "product/battle-axe.png"
        )

    def supports_sale_media_test(
        self,
        media_client,
        media_file: Path,
        media_system,
    ):
        media_system.get.return_value = (media_file, "video/mp4")

        response = media_client.get(
            "/media/sale/summer-sale.mp4"
        )

        assert response.status_code == 200
        assert response.content == b"media contents"
        assert response.headers["content-type"] == "video/mp4"
        media_system.get.assert_called_once_with(
            "sale/summer-sale.mp4"
        )

    def missing_media_returns_not_found_error_test(
        self,
        media_client,
        media_system,
    ):
        media_system.get.side_effect = ContentNotFoundException(
            "Media file not found",
        )

        response = media_client.get(
            "/media/product/missing.png"
        )

        assert_error_response(
            response,
            status_code=404,
            name="ContentNotFoundException",
            message="Media file not found",
        )
        media_system.get.assert_called_once_with(
            "product/missing.png"
        )

    def invalid_entity_type_returns_validation_error_test(
        self,
        media_client,
        media_system,
    ):
        response = media_client.get(
            "/media/category/battle-axe.png"
        )

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"
        media_system.get.assert_not_called()
