from unittest.mock import ANY, Mock

import pytest

from app.core.exceptions import AuthenticationException
from app.features.auth import api as auth_api_module
from tests.features.user.fixtures import user_record_factory
from tests.utils import assert_error_response, get_response_cookie


@pytest.mark.medium
class RefreshHandler_test:
    def functionality_test(self, auth_client, database, monkeypatch):
        user = user_record_factory()
        database.user.get.return_value = user
        decode_token = Mock(
            return_value={"sub": str(user.id), "type": "refresh"},
        )
        create_access_token = Mock(return_value="new-access-token")
        monkeypatch.setattr(
            auth_api_module,
            "decode_token",
            decode_token,
        )
        monkeypatch.setattr(
            auth_api_module,
            "create_access_token",
            create_access_token,
        )

        auth_client.cookies.set("refresh_token", "refresh-token")
        response = auth_client.get("/refresh")

        assert response.status_code == 200
        assert response.json() == {"accessToken": "new-access-token"}
        decode_token.assert_called_once_with("refresh-token")
        create_access_token.assert_called_once_with(user.id)

    def missing_refresh_cookie_returns_authentication_error_test(
        self,
        auth_client,
    ):
        response = auth_client.get("/refresh")

        assert_error_response(
            response,
            status_code=401,
            name="AuthenticationException",
            message="Refresh token required",
        )

    def wrong_token_type_returns_authentication_error_test(
        self,
        auth_client,
        database,
        monkeypatch,
    ):
        monkeypatch.setattr(
            auth_api_module,
            "decode_token",
            Mock(return_value={"sub": "7", "type": "access"}),
        )

        auth_client.cookies.set("refresh_token", "access-token")
        response = auth_client.get("/refresh")

        assert_error_response(
            response,
            status_code=401,
            name="AuthenticationException",
            message="Invalid token type",
        )
        database.user.get.assert_not_called()

    def unregistered_user_returns_authentication_error_test(
        self,
        auth_client,
        database,
        monkeypatch,
    ):
        user = user_record_factory(is_registered=False)
        database.user.get.return_value = user
        monkeypatch.setattr(
            auth_api_module,
            "decode_token",
            Mock(return_value={"sub": str(user.id), "type": "refresh"}),
        )

        auth_client.cookies.set("refresh_token", "refresh-token")
        response = auth_client.get("/refresh")

        assert_error_response(
            response,
            status_code=401,
            name="AuthenticationException",
            message="User is not registered",
        )


@pytest.mark.medium
class LoginHandler_test:
    def functionality_test(self, auth_client, database, monkeypatch):
        user = user_record_factory()
        database.user.get_by_email.return_value = user
        verify_password = Mock(return_value=True)
        issue_tokens = Mock(return_value="access-token")
        monkeypatch.setattr(
            auth_api_module,
            "verify_password",
            verify_password,
        )
        monkeypatch.setattr(
            auth_api_module,
            "issue_tokens",
            issue_tokens,
        )

        response = auth_client.post(
            "/login",
            json={
                "login": {
                    "email": user.email,
                    "password": "correct-password",
                },
            },
        )

        assert response.status_code == 200
        assert response.json() == {
            "accessToken": "access-token",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "isAdmin": user.is_admin,
                "isRegistered": user.is_registered,
            },
        }
        database.user.get_by_email.assert_called_once_with(user.email)
        verify_password.assert_called_once_with(
            "correct-password",
            user.password_hash,
        )
        issue_tokens.assert_called_once_with(ANY, user.id)

    def unregistered_user_returns_generic_authentication_error_test(
        self,
        auth_client,
        database,
        monkeypatch,
    ):
        user = user_record_factory(is_registered=False)
        database.user.get_by_email.return_value = user
        issue_tokens = Mock()
        monkeypatch.setattr(
            auth_api_module,
            "issue_tokens",
            issue_tokens,
        )

        response = auth_client.post(
            "/login",
            json={
                "login": {
                    "email": user.email,
                    "password": "correct-password",
                },
            },
        )

        assert_error_response(
            response,
            status_code=401,
            name="AuthenticationException",
            message="Invalid email or password",
        )
        issue_tokens.assert_not_called()

    def invalid_password_returns_generic_authentication_error_test(
        self,
        auth_client,
        database,
        monkeypatch,
    ):
        user = user_record_factory()
        database.user.get_by_email.return_value = user
        monkeypatch.setattr(
            auth_api_module,
            "verify_password",
            Mock(
                side_effect=AuthenticationException("Incorrect Password"),
            ),
        )

        response = auth_client.post(
            "/login",
            json={
                "login": {
                    "email": user.email,
                    "password": "wrong-password",
                },
            },
        )

        assert_error_response(
            response,
            status_code=401,
            name="AuthenticationException",
            message="Invalid email or password",
        )

    def missing_login_fields_returns_validation_error_test(
        self,
        auth_client,
    ):
        response = auth_client.post("/login", json={"login": {}})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"


@pytest.mark.low
class LogoutHandler_test:
    def functionality_test(self, auth_client):
        response = auth_client.post("/logout")
        refresh_cookie = get_response_cookie(response, "refresh_token")

        assert response.status_code == 200
        assert refresh_cookie.value == ""
        assert refresh_cookie["max-age"] == "0"
        assert refresh_cookie["path"] == "/"
