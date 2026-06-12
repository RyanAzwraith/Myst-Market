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

def get_session(req: Request) -> Session:
    yield from req.app.state.db.get_session() 

def get_current_user(session=Depends(get_session), credentials=Depends(bearer_scheme)) -> User:
    access_token = credentials.credentials
    payload = decode_token(access_token)
    if payload["type"] != "access":
        raise AuthenticationException("Invalid Token Type")

    user = get_user(session, payload["sub"])
    return user

def get_admin_user(session=Depends(get_session), credentials=Depends(bearer_scheme)) -> User:
    access_token = credentials.credentials
    payload = decode_token(access_token)
    user = get_user(session, payload["sub"])
    if not user.isAdmin:
        raise AuthorizationException("Admin Authorization Required")
    return user