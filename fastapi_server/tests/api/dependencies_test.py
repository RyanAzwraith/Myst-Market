from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.api import dependencies
from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException,
)
from tests.api.fixtures import credentials_factory
from tests.features.user.fixtures import user_factory


@pytest.mark.medium
class GetDb_test:
    def functionality_test(self, database):
        session = object()
        bound_database = object()
        session_generator = MagicMock()
        session_generator.__next__.return_value = session
        database.session_factory.side_effect = None
        database.session_factory.return_value = session_generator
        database.with_session.return_value = bound_database
        request = SimpleNamespace(
            app=SimpleNamespace(
                state=SimpleNamespace(db=database),
            ),
        )

        result = dependencies.get_db(request)

        assert next(result) is bound_database
        database.session_factory.assert_called_once_with()
        database.with_session.assert_called_once_with(session)
        result.close()
        session_generator.close.assert_called_once_with()


@pytest.mark.medium
class GetCurrentUser_test:
    def functionality_test(self, database, monkeypatch):
        user = user_factory(user_id=8)
        database.user.get.return_value = user
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "access", "sub": "8"},
        )

        result = dependencies.get_current_user(
            db=database,
            credentials=credentials_factory(),
        )

        assert result is user
        database.user.get.assert_called_once_with(8)

    def rejects_non_access_tokens_test(self, database, monkeypatch):
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "refresh", "sub": "8"},
        )

        with pytest.raises(
            AuthenticationException,
            match="Invalid Token Type",
        ):
            dependencies.get_current_user(
                db=database,
                credentials=credentials_factory(),
            )


@pytest.mark.medium
class GetOptionalUser_test:
    def functionality_test(self, database):
        result = dependencies.get_optional_user(
            db=database,
            credentials=None,
        )

        assert result is None
        database.user.get.assert_not_called()

    def resolves_a_valid_optional_user_test(self, database, monkeypatch):
        user = user_factory(user_id=8)
        database.user.get.return_value = user
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "access", "sub": "8"},
        )

        result = dependencies.get_optional_user(
            db=database,
            credentials=credentials_factory(),
        )

        assert result is user
        database.user.get.assert_called_once_with(8)

    def rejects_a_blank_optional_token_test(self, database):
        result = dependencies.get_optional_user(
            db=database,
            credentials=credentials_factory(""),
        )

        assert result is None
        database.user.get.assert_not_called()


@pytest.mark.high
class GetAdminUser_test:
    def functionality_test(self, database, monkeypatch):
        user = user_factory(user_id=8, is_admin=True)
        database.user.get.return_value = user
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "access", "sub": "8"},
        )

        result = dependencies.get_admin_user(
            db=database,
            credentials=credentials_factory(),
        )

        assert result is user
        database.user.get.assert_called_once_with(8)

    def rejects_non_admin_users_test(self, database, monkeypatch):
        database.user.get.return_value = user_factory(
            user_id=8,
            is_admin=False,
        )
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "access", "sub": "8"},
        )

        with pytest.raises(
            AuthorizationException,
            match="Admin Authorization Required",
        ):
            dependencies.get_admin_user(
                db=database,
                credentials=credentials_factory(),
            )


@pytest.mark.medium
class GetSetPasswordUser_test:
    def functionality_test(self, database, monkeypatch):
        user = user_factory(user_id=8)
        database.user.get.return_value = user
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "set_password", "sub": "8"},
        )

        result = dependencies.get_set_password_user(
            db=database,
            credentials=credentials_factory(),
        )

        assert result is user
        database.user.get.assert_called_once_with(8)

    def rejects_access_tokens_test(self, database, monkeypatch):
        monkeypatch.setattr(
            dependencies,
            "decode_token",
            lambda token: {"type": "access", "sub": "8"},
        )

        with pytest.raises(
            AuthenticationException,
            match="Invalid Token Type",
        ):
            dependencies.get_set_password_user(
                db=database,
                credentials=credentials_factory(),
            )
