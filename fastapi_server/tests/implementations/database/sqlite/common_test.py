import pytest
from sqlalchemy import select

from app.core.exceptions import ContentNotFoundException
from app.implementations.database.sqlite.common import (
    execute_page,
    get_model,
    validate_pagination,
)
from app.implementations.database.sqlite.models.user import User
from tests.implementations.database.sqlite.fixtures import (
    user_model_factory,
)


@pytest.mark.medium
class GetModel_test:
    def functionality_test(self, sqlite_session):
        user = user_model_factory()
        sqlite_session.add(user)
        sqlite_session.commit()

        result = get_model(sqlite_session, User, "User", user.id)

        assert result is user

    def raises_not_found_for_missing_model_test(self, sqlite_session):
        with pytest.raises(
            ContentNotFoundException,
            match="User Not Found",
        ) as error:
            get_model(sqlite_session, User, "User", 99)

        assert error.value.details == {"user_id": 99}


@pytest.mark.low
class ValidatePagination_test:
    def functionality_test(self):
        validate_pagination(None, 0)
        validate_pagination(10, 2)

    @pytest.mark.parametrize(
        ("limit", "offset"),
        [(-1, 0), (None, -1), (0, -1)],
    )
    def rejects_negative_values_test(self, limit, offset):
        with pytest.raises(ValueError):
            validate_pagination(limit, offset)


@pytest.mark.medium
class ExecutePage_test:
    def functionality_test(self, sqlite_session):
        users = [
            user_model_factory(
                user_id=1,
                email="one@example.com",
            ),
            user_model_factory(
                user_id=2,
                email="two@example.com",
            ),
            user_model_factory(
                user_id=3,
                email="three@example.com",
            ),
        ]
        sqlite_session.add_all(users)
        sqlite_session.commit()

        rows, has_more = execute_page(
            sqlite_session,
            select(User).order_by(User.id),
            limit=2,
            offset=0,
        )

        assert [row[User].id for row in rows] == [1, 2]
        assert has_more is True

    def returns_all_rows_without_limit_test(self, sqlite_session):
        users = [
            user_model_factory(user_id=1),
            user_model_factory(user_id=2, email="two@example.com"),
        ]
        sqlite_session.add_all(users)
        sqlite_session.commit()

        rows, has_more = execute_page(
            sqlite_session,
            select(User).order_by(User.id),
            limit=None,
            offset=1,
        )

        assert [row[User].id for row in rows] == [2]
        assert has_more is False
