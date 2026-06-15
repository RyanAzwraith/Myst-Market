from datetime import datetime, timedelta, timezone
from fastapi import Response
import jwt

from app.core import get_config
from app.core.exceptions import (
    AuthenticationException
)

ALGORITHM = "HS256"

# Logic

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=get_config().access_token_minutes),
    }
    return jwt.encode(payload, get_config().jwt_key, algorithm=ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(hours=get_config().refresh_token_hours),
    }
    return jwt.encode(payload, get_config().jwt_key, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, get_config().jwt_key, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise AuthenticationException("Expired Token", status_code=451 )
    except jwt.InvalidTokenError:
        raise AuthenticationException("Invalid Token")
        

def issue_tokens(user_id: int, res: Response) -> str:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=get_config().refresh_token_hours * 60 * 60,
        path="/"
    )
    return access_token
