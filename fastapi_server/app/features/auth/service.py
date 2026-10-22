from datetime import datetime, timedelta, timezone
from typing import Any
import bcrypt
import jwt
from fastapi import Response

from app.core.config import get_config
from app.core.exceptions import AuthenticationException

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

    
def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        raise AuthenticationException("Incorrect Password")

    try:
        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        raise AuthenticationException("Incorrect Password") from None

    if not password_matches:
        raise AuthenticationException("Incorrect Password")

    return True

def _create_token(
    user_id: int,
    token_type: str,
    lifetime: timedelta,
) -> str:
    issued_at = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": issued_at,
        "exp": issued_at + lifetime,
    }
    return jwt.encode(
        payload,
        get_config().jwt_key,
        algorithm=get_config().token_algorithm,
    )


def create_access_token(user_id: int) -> str:
    lifetime = timedelta(minutes=get_config().access_token_minutes)
    return _create_token(user_id, "access", lifetime)


def create_refresh_token(user_id: int) -> str:
    lifetime = timedelta(hours=get_config().refresh_token_hours)
    return _create_token(user_id, "refresh", lifetime)


def create_set_password_token(user_id: int) -> str:
    lifetime = timedelta(hours=get_config().refresh_token_hours)
    return _create_token(user_id, "set_password", lifetime)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token, get_config().jwt_key, 
            algorithms=[get_config().token_algorithm]
        )
    except jwt.ExpiredSignatureError:
        raise AuthenticationException("Expired Token", status_code=451)
    except jwt.InvalidTokenError:
        raise AuthenticationException("Invalid Token")


def issue_tokens(response: Response, user_id: int) -> str:
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=get_config().environment not in {"development", "dev", "test", "testing"},
        samesite="strict",
        max_age=get_config().refresh_token_hours * 60 * 60,
        path="/",
    )
    return create_access_token(user_id)
