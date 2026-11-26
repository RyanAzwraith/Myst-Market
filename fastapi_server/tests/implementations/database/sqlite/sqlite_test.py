import pytest

from app.implementations.database.sqlite.queries.item import SqliteItem
from app.implementations.database.sqlite.queries.media import SqliteMedia
from app.implementations.database.sqlite.queries.order import SqliteOrder
from app.implementations.database.sqlite.queries.payment import SqlitePayment
from app.implementations.database.sqlite.queries.product import SqliteProduct
from app.implementations.database.sqlite.queries.review import SqliteReview
from app.implementations.database.sqlite.queries.sale import SqliteSale
from app.implementations.database.sqlite.queries.user import SqliteUser


@pytest.mark.medium
class SqliteDatabase_test:
    def functionality_test(self, sqlite_database, sqlite_session):
        database = sqlite_database.with_session(sqlite_session)

        assert database.media.__class__ is SqliteMedia
        assert database.item.__class__ is SqliteItem
        assert database.order.__class__ is SqliteOrder
        assert database.payment.__class__ is SqlitePayment
        assert database.product.__class__ is SqliteProduct
        assert database.review.__class__ is SqliteReview
        assert database.sale.__class__ is SqliteSale
        assert database.user.__class__ is SqliteUser

    def shares_engine_and_session_maker_test(
        self,
        sqlite_database,
        sqlite_session,
    ):
        database = sqlite_database.with_session(sqlite_session)

        assert database.engine is sqlite_database.engine
        assert database.make_session is sqlite_database.make_session
        assert database._session is sqlite_session

    def rejects_unbound_query_access_test(self, sqlite_database):
        with pytest.raises(
            RuntimeError,
            match="A session is required",
        ):
            sqlite_database.media

    def creates_a_new_session_per_generator_test(self, sqlite_database):
        first_generator = sqlite_database.session_factory()
        second_generator = sqlite_database.session_factory()

        first_session = next(first_generator)
        second_session = next(second_generator)

        assert first_session is not second_session
        first_generator.close()
        second_generator.close()
