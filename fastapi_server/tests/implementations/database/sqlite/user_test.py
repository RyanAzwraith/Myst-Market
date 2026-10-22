from datetime import date

import pytest

from app.core.exceptions import ConflictException, ContentNotFoundException
from tests.implementations.database.sqlite.fixtures import (
    user_model_factory,
)


@pytest.mark.medium
class SqliteUserGet_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add(user_model_factory())
        sqlite_session.commit()

        result = session_database.user.get(1)

        assert result.id == 1
        assert result.email == "user@example.com"
        assert result.name == "Test User"

    def gets_by_email_test(self, session_database, sqlite_session):
        sqlite_session.add(user_model_factory())
        sqlite_session.commit()

        assert session_database.user.get_by_email(
            "user@example.com"
        ).id == 1

    def raises_for_missing_user_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="User Not Found",
        ) as error:
            session_database.user.get(42)

        assert error.value.details == {"user_id": 42}


@pytest.mark.medium
class SqliteUserCreate_test:
    def functionality_test(self, session_database):
        result = session_database.user.create(
            email="new@example.com",
            name="New User",
            is_registered=True,
            password_hash="hash",
        )

        assert result.email == "new@example.com"
        assert result.is_registered is True

    def rejects_existing_registered_email_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add(user_model_factory())
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="email already exists",
        ):
            session_database.user.create(
                email="user@example.com",
                name="Other",
                is_registered=True,
            )

    def reactivates_deleted_guest_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add(
            user_model_factory(
                is_registered=False,
                name=None,
                deleted_at=date.today(),
            )
        )
        sqlite_session.commit()

        result = session_database.user.create(
            email="user@example.com",
            name="Restored",
            is_registered=True,
            password_hash="new-hash",
        )

        assert result.name == "Restored"
        assert result.is_registered is True
        restored = sqlite_session.get(
            type(user_model_factory()),
            1,
        )
        assert restored.deleted_at is None
        assert restored.password_hash == "new-hash"


@pytest.mark.medium
class SqliteUserPatch_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add(user_model_factory())
        sqlite_session.commit()

        result = session_database.user.patch(
            1,
            name="Updated",
            is_admin=True,
        )

        assert result.name == "Updated"
        assert result.is_admin is True

    def rejects_duplicate_email_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                user_model_factory(
                    user_id=2,
                    email="other@example.com",
                ),
            ]
        )
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="email already exists",
        ):
            session_database.user.patch(
                1,
                email="other@example.com",
            )


@pytest.mark.medium
class SqliteUserDelete_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add(user_model_factory())
        sqlite_session.commit()

        session_database.user.delete(1)
        deleted = sqlite_session.get(
            type(user_model_factory()),
            1,
        )

        assert deleted.name is None
        assert deleted.is_registered is False
        assert deleted.deleted_at == date.today()


@pytest.mark.medium
class SqliteUserSearch_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(
                    user_id=1,
                    email="alice@example.com",
                    name="Alice",
                ),
                user_model_factory(
                    user_id=2,
                    email="bob@example.com",
                    name="Bob",
                    is_registered=False,
                ),
                user_model_factory(
                    user_id=3,
                    email="deleted@example.com",
                    name="Deleted",
                    deleted_at=date.today(),
                ),
            ]
        )
        sqlite_session.commit()

        result, has_more = session_database.user.search(
            search="ali",
            registrations=["registered"],
            sort_by="alphabet",
            is_ascending=True,
            limit=10,
            offset=0,
        )

        assert [user.email for user in result] == ["alice@example.com"]
        assert result[0].order_count == 0
        assert has_more is False

    def rejects_unknown_registration_filter_test(
        self,
        session_database,
    ):
        with pytest.raises(
            ValueError,
            match="Unsupported registration filter",
        ):
            session_database.user.search(
                search=None,
                registrations=["unknown"],
                sort_by=None,
                is_ascending=None,
                limit=None,
                offset=0,
            )

    def counts_only_active_registered_customers_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(user_id=1),
                user_model_factory(
                    user_id=2,
                    email="guest@example.com",
                    is_registered=False,
                ),
                user_model_factory(
                    user_id=3,
                    email="deleted@example.com",
                    deleted_at=date.today(),
                ),
            ]
        )
        sqlite_session.commit()

        assert session_database.user.count_customers() == 1
