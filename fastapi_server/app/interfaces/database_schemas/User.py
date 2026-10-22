from __future__ import annotations

from abc import ABC, abstractmethod

from app.features.user.schema import User as UserSchema
from app.features.user.schema import UserAnalytics



class User(ABC):
    @abstractmethod
    def get(self, user_id: int) -> UserSchema:
        ...

    @abstractmethod
    def get_by_email(self, email: str) -> UserSchema:
        ...

    @abstractmethod
    def search(
        self,
        search: str | None,
        registrations: list[str] | None,
        sort_by: str | None,
        is_ascending: bool | None,
        limit: int | None,
        offset: int,
    ) -> tuple[list[UserAnalytics], bool]:
        ...

    @abstractmethod
    def get_analytics(
        self,
        user_id: int,
    ) -> UserAnalytics:
        ...

    @abstractmethod
    def create(
        self,
        email: str,
        name: str | None,
        is_registered: bool,
        password_hash: str | None = None,
    ) -> UserSchema:
        ...

    @abstractmethod
    def patch(
        self,
        user_id: int,
        email: str | None = None,
        name: str | None = None,
        is_registered: bool | None = None,
        is_admin: bool | None = None,
        password_hash: str | None = None,
    ) -> UserSchema:
        ...

    @abstractmethod
    def delete(self, user_id: int) -> None:
        ...

    @abstractmethod
    def count_customers(self) -> int:
        ...
