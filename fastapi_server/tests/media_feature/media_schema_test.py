from app.db.models import Media
from app.features.media.media_schema import (
    CsvImportError,
    CsvImportResponse,
    GetProductMediaResponse,
    GetSaleMediaResponse,
    MediaDetail,
    RetrieveProductsMediaRequest,
    RetrieveProductsMediaResponse,
    RetrieveSalesMediaRequest,
    RetrieveSalesMediaResponse,
)


class media_detail_test:
    def from_media_test(self):
        media = Media(
            id=4,
            type="image",
            file_name="image.jpg",
            entity_id=8,
            entity_type="product",
            alt_text="Product image",
            sort_order=2,
        )

        result = MediaDetail.from_Media(media, "/media/product/image.jpg")

        assert result.id == media.id
        assert result.media_type == media.type
        assert result.media_url == "/media/product/image.jpg"
        assert result.entity_id == media.entity_id
        assert result.entity_type == media.entity_type
        assert result.alt_text == media.alt_text
        assert result.sort_order == media.sort_order


class media_response_schemas_test:
    def single_entity_responses_test(self):
        detail = MediaDetail(
            id=1,
            media_type="image",
            media_url="/media/product/image.jpg",
            entity_id=2,
            entity_type="product",
            alt_text=None,
            sort_order=0,
        )

        assert GetProductMediaResponse(media=[detail]).media == [detail]
        assert GetSaleMediaResponse(media=[detail]).media == [detail]

    def batch_requests_and_responses_test(self):
        detail = MediaDetail(
            id=1,
            media_type="image",
            media_url="/media/product/image.jpg",
            entity_id=2,
            entity_type="product",
            alt_text=None,
            sort_order=0,
        )

        product_request = RetrieveProductsMediaRequest(product_ids=[2])
        sale_request = RetrieveSalesMediaRequest(sale_ids=[3])
        product_response = RetrieveProductsMediaResponse(media={2: detail})
        sale_response = RetrieveSalesMediaResponse(media={3: detail})

        assert product_request.product_ids == [2]
        assert sale_request.sale_ids == [3]
        assert product_response.media[2] == detail
        assert sale_response.media[3] == detail

    def import_response_test(self):
        error = CsvImportError(row=3, field="name", message="Required")
        result = CsvImportResponse(
            imported=1,
            updated=2,
            failed=1,
            errors=[error],
        )

        assert result.imported == 1
        assert result.updated == 2
        assert result.failed == 1
        assert result.errors == [error]
