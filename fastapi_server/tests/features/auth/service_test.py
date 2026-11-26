from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

import jwt
import pytest
from fastapi import Response

from app.core.exceptions import AuthenticationException
from app.features.auth import service as auth_service
from tests.features.auth.fixtures import auth_config_factory
from tests.utils import get_response_cookie


@pytest.mark.low
class HashPassword_test:
    def functionality_test(self):
        password = "correct-password"

        password_hash = auth_service.hash_password(password)

        assert password_hash != password
        assert auth_service.verify_password(password, password_hash) is True


@pytest.mark.low
class VerifyPassword_test:
    def functionality_test(self):
        password_hash = auth_service.hash_password("correct-password")

        assert auth_service.verify_password(
            "correct-password",
            password_hash,
        ) is True

    def wrong_password_raises_authentication_error_test(self):
        password_hash = auth_service.hash_password("correct-password")

        with pytest.raises(
            AuthenticationException,
            match="Incorrect Password",
        ):
            auth_service.verify_password("wrong-password", password_hash)

    @pytest.mark.parametrize("password_hash", [None, "not-a-password-hash"])
    def invalid_password_hash_raises_authentication_error_test(
        self,
        password_hash,
    ):
        with pytest.raises(
            AuthenticationException,
            match="Incorrect Password",
        ):
            auth_service.verify_password("correct-password", password_hash)


@pytest.mark.low
class CreateAccessToken_test:
    def functionality_test(self, configured_auth):
        token = auth_service.create_access_token(42)
        payload = jwt.decode(
            token,
            configured_auth.jwt_key,
            algorithms=[configured_auth.token_algorithm],
        )

        assert payload["sub"] == "42"
        assert payload["type"] == "access"
        assert payload["exp"] > payload["iat"]
        assert payload["exp"] - payload["iat"] == 15 * 60


@pytest.mark.low
class CreateRefreshToken_test:
    def functionality_test(self, configured_auth):
        token = auth_service.create_refresh_token(42)
        payload = jwt.decode(
            token,
            configured_auth.jwt_key,
            algorithms=[configured_auth.token_algorithm],
        )

        assert payload["sub"] == "42"
        assert payload["type"] == "refresh"
        assert payload["exp"] - payload["iat"] == 12 * 60 * 60


@pytest.mark.low
class CreateSetPasswordToken_test:
    def functionality_test(self, configured_auth):
        token = auth_service.create_set_password_token(42)
        payload = jwt.decode(
            token,
            configured_auth.jwt_key,
            algorithms=[configured_auth.token_algorithm],
        )

        assert payload["sub"] == "42"
        assert payload["type"] == "set_password"
        assert payload["exp"] - payload["iat"] == 12 * 60 * 60


@pytest.mark.low
class DecodeToken_test:
    def functionality_test(self, configured_auth):
        token = auth_service.create_access_token(42)

        payload = auth_service.decode_token(token)

        assert payload["sub"] == "42"
        assert payload["type"] == "access"

    def invalid_token_raises_authentication_error_test(
        self,
        configured_auth,
    ):
        with pytest.raises(
            AuthenticationException,
            match="Invalid Token",
        ):
            auth_service.decode_token("not-a-token")

    def expired_token_raises_expired_authentication_error_test(
        self,
        configured_auth,
    ):
        issued_at = datetime.now(timezone.utc) - timedelta(minutes=2)
        token = jwt.encode(
            {
                "sub": "42",
                "type": "access",
                "iat": issued_at - timedelta(minutes=1),
                "exp": issued_at,
            },
            configured_auth.jwt_key,
            algorithm=configured_auth.token_algorithm,
        )

        with pytest.raises(AuthenticationException) as error:
            auth_service.decode_token(token)

        assert error.value.message == "Expired Token"
        assert error.value.status_code == 451


@pytest.mark.low
class IssueTokens_test:
    def functionality_test(self, configured_auth):
        response = Response()

        access_token = auth_service.issue_tokens(response, 42)
        access_payload = auth_service.decode_token(access_token)
        refresh_cookie = get_response_cookie(response, "refresh_token")

        assert access_payload["sub"] == "42"
        assert access_payload["type"] == "access"
        assert refresh_cookie.value
        assert refresh_cookie["httponly"] == True
        assert refresh_cookie["secure"] == ""
        assert refresh_cookie["samesite"] == "strict"
        assert refresh_cookie["max-age"] == str(12 * 60 * 60)
        assert refresh_cookie["path"] == "/"

    def returns_a_new_access_token_for_each_user_test(
        self,
        configured_auth,
    ):
        first_response = Response()
        second_response = Response()

        first_token = auth_service.issue_tokens(first_response, 1)
        second_token = auth_service.issue_tokens(second_response, 2)

        assert auth_service.decode_token(first_token)["sub"] == "1"
        assert auth_service.decode_token(second_token)["sub"] == "2"
