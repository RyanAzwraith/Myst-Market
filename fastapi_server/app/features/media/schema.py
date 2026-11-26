from enum import Enum

from app.core.Base import Base


class MediaType(str, Enum):
    image = "image"
    video = "video"


class EntityType(str, Enum):
    product = "product"
    sale = "sale"


class MediaDetail(Base):
    id: int
    media_type: MediaType
    media_url: str
    entity_id: int
    entity_type: EntityType
    alt_text: str | None
    sort_order: int | None