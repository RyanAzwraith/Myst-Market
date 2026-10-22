from fastapi import APIRouter, Cookie, Depends, Response

from app.api.dependencies import get_db
from app.api.paths import Paths
from app.core.Base import Base
from app.core.exceptions import AuthenticationException

from app.features.user.schema import User

from .schema import Login
from .service import decode_token, create_access_token, issue_tokens, verify_password

auth_router = APIRouter()


# Refresh Access Token
class RefreshAccessTokenResponse(Base):
    access_token: str


@auth_router.get(
    Paths.Auth.refresh,
    status_code=200,
    response_model=RefreshAccessTokenResponse,
)
async def refresh_handler(
    refresh_token: str | None = Cookie(default=None),
    db=Depends(get_db),
):
    if not refresh_token:
        raise AuthenticationException("Refresh token required")

    payload = decode_token(refresh_token)
    if payload["type"] != "refresh":
        raise AuthenticationException("Invalid token type")

    user = db.user.get(int(payload["sub"]))
    if not user.is_registered:
        raise AuthenticationException("User is not registered")

    access_token = create_access_token(user.id)
    return RefreshAccessTokenResponse(access_token=access_token)


# Login
class LoginResponse(Base):
    access_token: str
    user: User


class LoginRequest(Base):
    login: Login


@auth_router.post(
    Paths.Auth.login,
    status_code=200,
    response_model=LoginResponse,
)
async def login_handler(
    req: LoginRequest,
    res: Response,
    db=Depends(get_db),
):
    try:
        user = db.user.get_by_email(req.login.email)
        if not user.is_registered: raise Exception()
        verify_password(req.login.password, user.password_hash)
    except Exception:
        raise AuthenticationException("Invalid email or password")
    
    access_token = issue_tokens(res, user.id)
    return LoginResponse(access_token=access_token, user=user)


# Logout
@auth_router.post(
    Paths.Auth.logout,
    status_code=200,
)
async def logout_handler(res: Response):
    res.delete_cookie("refresh_token", path="/")