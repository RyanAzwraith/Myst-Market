from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.interfaces.database import Database
from app.interfaces.database_schemas.Item import Item
from app.interfaces.database_schemas.Media import Media
from app.interfaces.database_schemas.Order import Order
from app.interfaces.database_schemas.Payment import Payment
from app.interfaces.database_schemas.Product import Product
from app.interfaces.database_schemas.Review import Review
from app.interfaces.database_schemas.Sale import Sale
from app.interfaces.database_schemas.User import User

from .models import address as _address_model
from .models import payment as _payment_model
from .queries.sale import SqliteSale
from .queries.product import SqliteProduct
from .queries.review import SqliteReview
from .queries.item import SqliteItem
from .queries.payment import SqlitePayment
from .queries.order import SqliteOrder
from .queries.media import SqliteMedia
from .queries.user import SqliteUser


class SqliteDatabase(Database):
    def __init__(
        self,
        database_url: str,
        *,
        files_url: str | None = None,
        engine: Engine | None = None,
        session_maker=None,
        session: Session | None = None,
    ):
        self.url = database_url
        self.files_url = files_url
        self.engine = engine or create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )
        self._session_maker = session_maker or sessionmaker(
            bind=self.engine,
            autoflush=False,
            expire_on_commit=False,
        )
        self.make_session = self._session_maker
        self._session = session

    def session_factory(self) -> Generator[Session, None, None]:
        session = self._session_maker()
        try:
            yield session
        finally:
            session.close()

    def with_session(self, session: Session) -> "SqliteDatabase":
        return SqliteDatabase(
            self.url,
            files_url=self.files_url,
            engine=self.engine,
            session_maker=self._session_maker,
            session=session,
        )

    @property
    def media(self) -> Media:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteMedia(self._session, files_url=self.files_url)

    @property
    def order(self) -> Order:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteOrder(self._session)

    @property
    def item(self) -> Item:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteItem(self._session)

    @property
    def payment(self) -> Payment:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqlitePayment(self._session)

    @property
    def product(self) -> Product:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteProduct(self._session)

    @property
    def review(self) -> Review:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteReview(self._session)

    @property
    def sale(self) -> Sale:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteSale(self._session)

    @property
    def user(self) -> User:
        if self._session is None:
            raise RuntimeError(
                "A session is required; call with_session first"
            )
        return SqliteUser(self._session)


__all__ = ["SqliteDatabase"]