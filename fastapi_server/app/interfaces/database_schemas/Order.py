from __future__ import annotations

from abc import ABC, abstractmethod

from app.features.app.schema import GraphPoint, Performance
from app.features.item.schema import ItemResolution
from app.features.order.schema import Address as AddressSchema
from app.features.order.schema import Order as OrderSchema


class Order(ABC):
    @abstractmethod
    def get(
        self,
        order_id: int,
    ) -> OrderSchema:
        ...

    @abstractmethod
    def get_all(
        self,
        user_id: int | None = None,
    ) -> list[OrderSchema]:
        ...

    @abstractmethod
    def get_recent(
        self,
        limit: int = 10,
    ) -> list[OrderSchema]:
        ...

    @abstractmethod
    def search_admin(
        self,
        search_name: str | None = None,
        statuses: list[str] | None = None,
        sort_by: str | None = None,
        is_ascending: bool | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[list[OrderSchema], bool]:
        ...

    @abstractmethod
    def create_with_items(
        self,
        user_id: int,
        address: AddressSchema,
        items: list[ItemResolution],
        status: str,
        cost_aud_cent: int,
        delivery_note: str | None,
    ) -> OrderSchema:
        ...

    @abstractmethod
    def patch_status(
        self,
        order_id: int,
        status: str,
    ) -> None:
        ...

    @abstractmethod
    def patch_statuses(
        self,
        order_ids: list[int],
        status: str,
    ) -> None:
        ...

    @abstractmethod
    def count_by_status(self, status: str) -> int:
        ...

    @abstractmethod
    def get_performance(
        self,
        days: int,
    ) -> Performance:
        ...

    @abstractmethod
    def get_graph(
        self,
        months: int,
    ) -> list[GraphPoint]:
        ...
