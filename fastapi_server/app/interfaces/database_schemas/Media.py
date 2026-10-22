from __future__ import annotations

from abc import ABC, abstractmethod

from app.features.media import MediaDetail


class Media(ABC):
    @abstractmethod
    def get_all(
        self,
        entity_type: str | None = None,
        entity_id: int | None = None,
    ) -> list[MediaDetail]:
        ...

    @abstractmethod
    def get_primary(
        self,
        entity_type: str,
        entity_id: int,
    ) -> MediaDetail:
        ...

    @abstractmethod
    def get_primary_for_many(
        self,
        entity_type: str,
        entity_ids: list[int],
    ) -> list[MediaDetail]:
        ...

    @abstractmethod
    def cleanup(self):
        ...