from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path


class MediaSystem(ABC):
    @abstractmethod
    async def create(
        self,
        content: bytes,
        original_name: str,
        directory: str | None = None,
    ) -> str:
        ...

    @abstractmethod
    def get(self, path: str) -> tuple[Path, str]:
        ...

    @abstractmethod
    def exists(self, path: str) -> bool:
        ...

    @abstractmethod
    def list(self, directory: str | None = None) -> list[str]:
        ...

    @abstractmethod
    def delete(self, path: str) -> None:
        ...

    @abstractmethod
    def cleanup(self) -> None:
        ...