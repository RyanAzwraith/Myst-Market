from datetime import datetime, timedelta, timezone
from fastapi import Response
import jwt
import resend

from app.core import get_config
from app.core.exceptions import (
    AuthenticationException
)

config = get_config()

ACCESS_TOKEN_MINUTES = config.access_token_minutes
REFRESH_TOKEN_MINUTES = config.refresh_token_hours
JWT_KEY = config.jwt_key
ALGORITHM = "HS256"

CORS_ORIGINS = get_config().cors_origins
RESEND_KEY = get_config().resend_key

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, JWT_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(hours=REFRESH_TOKEN_MINUTES),
    }
    return jwt.encode(payload, JWT_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_KEY, algorithms=[ALGORITHM])
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
        max_age=REFRESH_TOKEN_MINUTES * 60 * 60,
        path="/"
    )
    return access_token

def create_set_password_token(user_id):
    payload = {
        "sub": str(user_id),
        "type": "set_password",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, JWT_KEY, algorithm=ALGORITHM)


def send_set_password_email(email: str, token: str) -> None:
    link = (f"{CORS_ORIGINS}" f"/set-password?token={token}")
    resend.Emails.send({
        "from": "ryanAzwraith@gmail.com",
        "to": email,
        "subject": "Reset Password",
        "html": f"""
            <h1>Reset Password</h1>
            <a href="{link}">
                Reset Password
            </a>
        """
    })