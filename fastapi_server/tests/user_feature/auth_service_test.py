import pytest
from fastapi import Response
import jwt
from datetime import datetime, timedelta, timezone


from app.core import get_config
from app.core.exceptions import (
    AuthenticationException,
)
from app.features.user.auth_service import (
    ALGORITHM,
    create_access_token,
    decode_token,
    create_refresh_token,
    create_set_password_token,
    issue_tokens
)

@pytest.fixture
def expired_token():
    return jwt.encode(
        {
            "sub": "1",
            "type": "access",
            "exp": datetime.now(timezone.utc) - timedelta(hours=4),
        }
        , get_config().jwt_key, 
        algorithm=ALGORITHM
    )

class access_token_test:
    def round_trip_test(self):
        token = create_access_token(123)
        payload = decode_token(token)

        assert payload["sub"] == "123"
        assert payload["type"] == "access"

class refresh_token_test:
    def round_trip_test(self):
        token = create_refresh_token(123)
        payload = decode_token(token)

        assert payload["sub"] == "123"
        assert payload["type"] == "refresh"


class decode_token_test:
    def invalid_token_test(self):
        with pytest.raises(AuthenticationException):
            decode_token("invalid.token.here")

    def expired_token_test(self, expired_token):
        with pytest.raises(AuthenticationException):
            decode_token(expired_token)

class issue_tokens_test:
    def functionality_test(self):
        res = Response()
        access_token = issue_tokens(123, res)

        assert access_token is not None

        cookies = res.headers.getlist("set-cookie")
        assert any("refresh_token=" in c for c in cookies)

        cookie = next(c for c in cookies if "refresh_token=" in c)
        refresh_token = cookie.split("refresh_token=")[1].split(";")[0]
        payload = decode_token(refresh_token)

        assert payload["sub"] == "123"
        assert payload["type"] == "refresh"

class create_set_password_token_test:
    def round_trip_test(self):
        token = create_set_password_token(123)
        payload = decode_token(token)

        assert payload["sub"] == "123"
        assert payload["type"] == "set_password"

class send_set_password_email_test:
    pass
