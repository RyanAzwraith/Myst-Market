from __future__ import annotations

from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def create(
        self,
        amount_cent: int,
        reference: str,
        provider: str,
        currency_code: int,
        status: str | None,
        order_id: int,
        user_id: int,
    ):
        ...
