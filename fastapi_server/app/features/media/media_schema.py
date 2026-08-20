from typing import Literal

from app.api.api_model import APIModel
from app.db.models.media import Media


MediaType = Literal["image", "video"]
EntityType = Literal["product", "sale"]


class MediaDetail(APIModel):
    id: int
    media_type: MediaType
    media_url: str
    entity_id: int
    entity_type: EntityType
    alt_text: str | None
    sort_order: int | None

    @staticmethod
    def from_Media(media: Media, media_url: str):
        return MediaDetail(
            id=media.id,
            media_type=media.type,
            media_url=media_url,
            entity_id=media.entity_id,
            entity_type=media.entity_type,
            alt_text=media.alt_text,
            sort_order=media.sort_order,
        )


"""
ROUTES
GET /products/:id/media
POST /products/media
GET /sales/:id/media
POST /sales/media
GET /media/:entity_type/:file_name

GET /products/export
GET /sales/export
POST /products/import
POST /sales/import
"""


# Products
class GetProductMediaResponse(APIModel):
    media: list[MediaDetail]


class RetrieveProductsMediaRequest(APIModel):
    product_ids: list[int]


class RetrieveProductsMediaResponse(APIModel):
    media: dict[int, MediaDetail]


# Sales
class GetSaleMediaResponse(APIModel):
    media: list[MediaDetail]


class RetrieveSalesMediaRequest(APIModel):
    sale_ids: list[int]


class RetrieveSalesMediaResponse(APIModel):
    media: dict[int, MediaDetail]


class CsvImportError(APIModel):
    row: int
    field: str | None = None
    message: str


class CsvImportResponse(APIModel):
    imported: int
    updated: int
    failed: int
    errors: list[CsvImportError]
