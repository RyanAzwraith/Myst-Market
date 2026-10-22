from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date

from app.features.sale import Sale as SaleSchema
from app.features.sale import SaleAnalytics


class Sale(ABC):
    @abstractmethod
    def get(self, sale_id: int) -> SaleSchema:
        ...

    @abstractmethod
    def get_by_slug(self, slug: str) -> SaleSchema:
        ...

    @abstractmethod
    def get_all(self) -> list[SaleSchema]:
        ...

    @abstractmethod
    def get_biggest(
        self,
        limit: int,
    ) -> list[SaleSchema]:
        ...

    @abstractmethod
    def get_analytics(
        self,
        sale_id: int,
    ) -> SaleAnalytics:
        ...

    @abstractmethod
    def search_admin(
        self,
        search: str | None,
        activations: list[str] | None,
        sort_by: str | None,
        is_ascending: bool | None,
        limit: int | None,
        offset: int,
    ) -> tuple[list[SaleAnalytics], bool]:
        ...

    @abstractmethod
    def create(
        self,
        discount_perc: int,
        start_at: date,
        end_at: date,
        name: str,
        slug: str,
        description: str | None,
    ) -> SaleSchema:
        ...

    @abstractmethod
    def patch(
        self,
        sale_id: int,
        name: str | None = None,
        slug: str | None = None,
        description: str | None = None,
        start_at: date | None = None,
        end_at: date | None = None,
        discount_perc: int | None = None,
    ) -> SaleSchema:
        ...

    @abstractmethod
    def patch_many(
        self,
        sale_ids: list[int],
        start_at: date | None = None,
        end_at: date | None = None,
        discount_perc: int | None = None,
    ) -> None:
        ...

    @abstractmethod
    def delete(self, sale_id: int) -> None:
        ...

    @abstractmethod
    def count_ending_within(self, days: int) -> int:
        ...
