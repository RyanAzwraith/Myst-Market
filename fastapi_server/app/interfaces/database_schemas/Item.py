from __future__ import annotations

from abc import ABC, abstractmethod
from app.features.item.schema import ItemSummary

class Item(ABC):
    @abstractmethod
    def resolve(
        self,
        items: list[ItemSummary],
    ):
        ...
