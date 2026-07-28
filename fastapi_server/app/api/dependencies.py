from fastapi import Request, Depends
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException
)
from app.db.models import User
from app.features.user.auth_service import decode_token
from app.features.user.user_service import get_user

bearer_scheme = HTTPBearer()

optional_bearer_scheme = HTTPBearer(auto_error=False)

def get_session(req: Request) -> Session:
    yield from req.app.state.db.get_session() 

def get_current_user(
    session=Depends(get_session), 
    credentials=Depends(bearer_scheme)
) -> User:
    access_token = credentials.credentials
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")
    db_user = get_user(session, payload["sub"])
    return db_user


def get_optional_user(
    session=Depends(get_session), 
    credentials=Depends(optional_bearer_scheme)
) -> User | None:
    if not credentials:
        return None
    access_token = credentials.credentials
    if not access_token:
        return None
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")
    db_user = get_user(session, payload["sub"])
    return db_user


def get_admin_user(
    session=Depends(get_session), 
    credentials=Depends(bearer_scheme)
) -> User:
    access_token = credentials.credentials
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")
    db_user = get_user(session, payload["sub"])
    if not db_user.is_admin:
        raise AuthorizationException("Admin Authorization Required")
    return db_user

def get_set_password_user(
    session=Depends(get_session), 
    credentials=Depends(bearer_scheme)
) -> User:
    set_password_token = credentials.credentials
    payload = decode_token(set_password_token)
    db_user = get_user(session, payload["sub"])
    if payload["type"] != "set_password":
        raise AuthenticationException("Invalid Token Type")
    return db_user