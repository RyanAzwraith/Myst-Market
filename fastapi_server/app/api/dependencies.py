from fastapi import Request, Depends
from fastapi.security import HTTPBearer
from typing import Generator

from app.interfaces.database import Database
from app.features.user.schema import User

from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException
)
from app.features.auth import decode_token

bearer_scheme = HTTPBearer()

optional_bearer_scheme = HTTPBearer(auto_error=False)

def get_db(req: Request) -> Generator[Database, None, None]:
    session_generator = req.app.state.db.session_factory()
    session = next(session_generator)
    try:
        yield req.app.state.db.with_session(session)
    finally:
        session_generator.close()

def get_current_user(
    db=Depends(get_db), 
    credentials=Depends(bearer_scheme)
):
    access_token = credentials.credentials
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")
    user = db.user.get(int(payload["sub"]))
    return user


def get_optional_user(
    db=Depends(get_db), 
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
    user = db.user.get(int(payload["sub"]))
    return user


def get_admin_user(
    db=Depends(get_db), 
    credentials=Depends(bearer_scheme)
) -> User:
    access_token = credentials.credentials
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")
    user = db.user.get(int(payload["sub"]))
    if not user.is_admin:
        raise AuthorizationException("Admin Authorization Required")
    return user

def get_set_password_user(
    db=Depends(get_db), 
    credentials=Depends(bearer_scheme)
) -> User:
    set_password_token = credentials.credentials
    payload = decode_token(set_password_token)
    if payload["type"] != "set_password":
        raise AuthenticationException("Invalid Token Type")
    user = db.user.get(int(payload["sub"]))
    return user