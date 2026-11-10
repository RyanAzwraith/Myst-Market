from __future__ import annotations

from abc import ABC, abstractmethod
from typing import NamedTuple

from app.features.review.schema import Review as ReviewSchema


class ProductReviews(NamedTuple):
    reviews: list[ReviewSchema]
    average: float
    user_has_review: bool



class Review(ABC):
    @abstractmethod
    def get_for_product(
        self,
        product_id: int,
        user_id: int | None = None,
    ) -> ProductReviews:
        ...

    @abstractmethod
    def get_for_user(
        self,
        user_id: int,
    ) -> list[ReviewSchema]:
        ...

    @abstractmethod
    def get_testimonials(
        self,
        limit: int,
    ) -> list[ReviewSchema]:
        ...

    @abstractmethod
    def get_average_rating(self) -> float:
        ...

    @abstractmethod
    def create(
        self,
        user_id: int,
        product_id: int,
        rating: int,
        description: str | None,
    ) -> ReviewSchema:
        ...

    @abstractmethod
    def delete(
        self,
        review_id: int,
        user_id: int | None = None,
    ) -> None:
        ...
