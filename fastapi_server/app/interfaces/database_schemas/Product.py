from __future__ import annotations
from abc import ABC, abstractmethod

from app.features.product import ProductAnalytics, Product


class Product(ABC):
    @abstractmethod
    def get_by_slug(self, slug: str) -> Product:
        ...

    @abstractmethod
    def get_analytics(
        self,
        product_id: int,
    ) -> ProductAnalytics:
        ...

    @abstractmethod
    def get_featured(self, limit: int) -> list[Product]:
        ...

    @abstractmethod
    def get_popular(self, limit: int) -> list[Product]:
        ...

    @abstractmethod
    def get_newest(self, limit: int) -> list[Product]:
        ...

    @abstractmethod
    def get_most_sold(self, limit: int) -> list[ProductAnalytics]:
        ...

    @abstractmethod
    def search(
        self,
        categories: list[str] | None = None,        
        rarities: list[str] | None = None,
        search: str | None = None,
        is_discontinued: bool | None = None,
        sort: str | None = None,
        is_ascending: bool | None = None,
        offset: int | None = None,
        limit: int | None = None, 

    ) -> tuple[list[Product], int]:
        ...

    @abstractmethod
    def search_admin(
        self,
        categories: list[str] | None = None,        
        rarities: list[str] | None = None,
        search: str | None = None,
        is_discontinued: bool | None = None,
        sort: str | None = None,
        is_ascending: bool | None = None,
        offset: int | None = None,
        limit: int | None = None, 

    ) -> tuple[list[ProductAnalytics], int]:
        ...

    @abstractmethod
    def create(
        self,
        name: str,
        category: str,
        rarity: str,
        price_aud_cent: int,
        slug: str,
        description: str | None,
        stock: int,
    ) -> Product:
        ...

    @abstractmethod
    def patch(
        self,
        product_id: int,
        name: str | None = None,
        category: str | None = None,
        rarity: str | None = None,
        price_aud_cent: int | None = None,
        slug: str | None = None,
        description: str | None = None,
        stock: int | None = None,
    ) -> Product:
        ...

    @abstractmethod
    def patch_many(
        self,
        product_ids: list[int],
        category: str | None = None,
        rarity: str | None = None,
        price_aud_cent: int | None = None,
        stock: int | None = None,
    ) -> None:
        ...

    @abstractmethod
    def delete(self, product_id: int) -> None:
        ...

    @abstractmethod
    def count(
        self,
        include_discontinued: bool = False,
    ) -> int:
        ...

    @abstractmethod
    def count_out_of_stock(self) -> int:
        ...
