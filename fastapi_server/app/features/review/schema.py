from datetime import date

from app.core.Base import Base


class Review(Base):
    id: int
    user_name: str
    product_id: int
    product_slug: str
    created_at: date
    rating: int
    description: str | None = None


class ReviewInput(Base):
    product_id: int
    rating: int
    description: str | None = None