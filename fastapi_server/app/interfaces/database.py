from abc import ABC, abstractmethod
from typing import Generator
from sqlalchemy.orm import Session

from .database_schemas.Media import Media
from .database_schemas.Order import Order
from .database_schemas.Item import Item
from .database_schemas.Payment import Payment
from .database_schemas.Product import Product
from .database_schemas.Review import Review
from .database_schemas.Sale import Sale
from .database_schemas.User import User

class Database(ABC):

    @abstractmethod
    def session_factory(self) -> Generator[Session, None, None]:
        ...

    @abstractmethod
    def with_session(self, session: Session) -> "Database":
        ...

    @property
    @abstractmethod
    def media(self) -> Media:
        ...

    @property
    @abstractmethod
    def order(self) -> Order:
        ...

    @property
    @abstractmethod
    def item(self) -> Item:
        ...

    @property
    @abstractmethod
    def payment(self) -> Payment:
        ...

    @property
    @abstractmethod
    def product(self) -> Product:
        ...

    @property
    @abstractmethod
    def review(self) -> Review:
        ...

    @property
    @abstractmethod
    def sale(self) -> Sale:
        ...

    @property
    @abstractmethod
    def user(self) -> User:
        ...


__all__ = [
    "Database",
    "Media",
    "Order",
    "Item",
    "Payment",
    "Product",
    "Review",
    "Sale",
    "User",
]
