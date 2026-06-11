from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException

from app.core import config, logger

ALGORITHM = "HS256"

ACCESS_TOKEN_MINUTES = 15
REFRESH_TOKEN_DAYS = 30

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }

    return jwt.encode(
        payload,
        config.jwt_key,
        algorithm=ALGORITHM,
    )

def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc)
            + timedelta(days=REFRESH_TOKEN_DAYS),
    }

    return jwt.encode(
        payload,
        config.jwt_key,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            config.jwt_key,
            algorithms=[ALGORITHM],
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException("Token expired")

    except jwt.InvalidTokenError:
        raise HTTPException("Invalid token")