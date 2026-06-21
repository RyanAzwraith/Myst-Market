import pytest
from fastapi import Response
import jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr

from app.core import get_config
from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
    ContentNotFoundException
)
from app.api.dependencies import get_set_password_user
from app.features.user.auth_service import (
    ALGORITHM,
    create_access_token,
    decode_token,
    create_refresh_token,
    create_set_password_token,
    issue_tokens
)
from app.features.user.user_service import (
    hash_password,
    verify_password,
    get_user,
    get_user_by_email,
    create_user,
    update_user,
    deactivate_user
)
from app.features.user.user_api import (
    UserResponse,
    LoginRequest,
    LoginResponse,
    login_route,
    logout_route,
    RefreshResponse,
    refresh_route,
    RegisterRequest,
    register_route,
    post_set_password_email_route,
    UserPatchRequest,
    UserPatchResponse,
    patch_user_route,
    UserPatchPasswordRequest,
    UserPatchPasswordResponse,
    patch_user_password_route,
    deactivate_user_route,
    admin_deactivate_user_route
)

# ==========================================
# auth_service
# ==========================================

def test_access_token():
    token = create_access_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "access"
"""


def test_refresh_token():
    token = create_refresh_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "refresh"


def test_decode_token():
    with pytest.raises(AuthenticationException):
        decode_token("invalid.token.here")

    payload = {
        "sub": "1",
        "type": "access",
        "exp": datetime.now(timezone.utc) - timedelta(hours=4),
    }

    token = jwt.encode(payload, get_config().jwt_key, algorithm=ALGORITHM)

    with pytest.raises(AuthenticationException):
        decode_token(token)


def test_issue_tokens():
    res = Response()
    access_token = issue_tokens(123, res)

    assert access_token is not None

    cookie = res.headers.get("set-cookie")
    assert cookie is not None
    assert "refresh_token=" in cookie

    refresh_token = cookie.split("refresh_token=")[1].split(";")[0]
    payload = decode_token(refresh_token)

    assert payload["sub"] == "123"
    assert payload["type"] == "refresh"


def test_create_set_password_token():
    token = create_set_password_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "set_password"


def test_send_set_password_email():
    pass

# ==========================================
# user_service
# ==========================================

def test_hash_password():
    hashed = hash_password("password")
    is_verified = verify_password("password", hashed)

    assert hashed
    assert len(hashed) == 60
    assert is_verified is True


def test_verify_password():
    hashed = hash_password("password")

    with pytest.raises(AuthenticationException):
        verify_password("not password", hashed)


def test_get_user(db_session):
    db_user = get_user(db_session, 1)

    assert db_user
    assert db_user.id == 1

    with pytest.raises(ContentNotFoundException):
        get_user(db_session, 55)


def test_get_user_by_email(db_session):
    db_user = get_user_by_email(db_session, "admin@mystmarket.com")

    assert db_user
    assert db_user.id == 1

    with pytest.raises(ContentNotFoundException):
        get_user_by_email(db_session, "rando@mail.com")


def test_create_user(db_session):
    class Data(BaseModel):
        email: EmailStr
        name: str

    db_user = create_user(
        db_session,
        Data(
            email="adam@mystmarket.com",
            name="adam"
        )
    )

    assert isinstance(db_user, User)
    assert db_user.id
    assert db_user.email == "adam@mystmarket.com"
    assert db_user.is_registered is True
    assert db_user.password_hash is None
    assert db_user.is_admin is False
    assert db_user.created_at
    assert db_user.deleted_at is None

    with pytest.raises(ConflictException):
        create_user(
            db_session,
            Data(
                email="admin@mystmarket.com",
                name="Admin User"
            )
        )

    db_user = create_user(
        db_session,
        Data(
            email="customer_two@mystmarket.com",
            name="customer_two"
        )
    )

    assert db_user.email == "customer_two@mystmarket.com"
    assert db_user.id == 3
    assert db_user.is_registered is True
    assert db_user.deleted_at is not None


def test_update_user(db_session):
    class Data(BaseModel):
        name: str = "ben"
        email: EmailStr = "ben@mystmarket.com"
        password: str = "new password"

    db_user = update_user(db_session, 2, Data())

    assert db_user.name == "ben"

    db_user = get_user(db_session, 2)

    assert db_user.name == "ben"
    assert db_user.email == "ben@mystmarket.com"
    assert verify_password("new password", db_user.password_hash) is True
    assert db_user.is_registered is True

    class BlankName(BaseModel):
        name: str = " "

    db_user = update_user(db_session, 1, BlankName())

    assert db_user.name == "Admin User"


def test_deactivate_user(db_session):
    deactivate_user(db_session, 2)

    db_user = get_user(db_session, 2)

    assert db_user.email
    assert db_user.name is None
    assert db_user.password_hash is None
    assert db_user.is_registered is False
    assert db_user.is_admin is False
    assert db_user.deleted_at is not None


# ==========================================
# user_api
# ==========================================

@pytest.mark.asyncio
async def test_login_route_direct(db_session):
    req = LoginRequest(
        email="customer@mystmarket.com",
        password="password"
    )
    res = Response()
    result = await login_route(req=req, res=res, session=db_session)

    assert result.access_token is not None
    assert result.userResponse.email == "customer@mystmarket.com"
  
    cookie = res.headers.get("set-cookie")
    assert cookie is not None
    assert "refresh_token=" in cookie

    req = LoginRequest(
        email="customer@mystmarket.com",
        password="not password"
    )
    res = Response()
    with pytest.raises(AuthenticationException):
        await login_route(
            req=req,
            res=res,
            session=db_session
        )
    
    req = LoginRequest(
        email="rando@mail.com@mystmarket.com",
        password="password"
    )
    res = Response()
    with pytest.raises(AuthenticationException):
        await login_route(
            req=req,
            res=res,
            session=db_session
        )

    req = LoginRequest(
        email="customer_two@mystmarket.com",
        password="password"
    )
    res = Response()
    with pytest.raises(AuthenticationException):
        await login_route(
            req=req,
            res=res,
            session=db_session
        )

@pytest.mark.asyncio
async def test_logout_route():
    res = Response()
    res.set_cookie(
        key="refresh_token",
        value="fake_token",
        max_age= 4 * 60 * 60,
    )
    result = await logout_route(res=res)

    assert result is None

    cookie = res.headers.get("set-cookie")
    assert cookie is not None
    assert "Max-Age=0" in cookie

@pytest.mark.asyncio
async def test_refresh_route(db_session):
    res = Response()
    with pytest.raises(AuthenticationException):
        result = await refresh_route(res=res, session=db_session)

    res = Response()
    res.set_cookie(
        key="refresh_token",
        value="invalid_refresh_token",
        max_age= 4 * 60 * 60,
    )
    with pytest.raises(AuthenticationException):
        result = await refresh_route(res=res, session=db_session)
    
    res = Response()
    res.set_cookie(
        key="refresh_token",
        value=create_refresh_token(3),
        max_age= 4 * 60 * 60,
    )
    with pytest.raises(ConflictException):
        result = await refresh_route(res=res, session=db_session)
    
        
    res = Response()
    res.set_cookie(
        key="refresh_token",
        value=create_refresh_token(2),
        max_age= 4 * 60 * 60,
    )
    result = await refresh_route(res=res, session=db_session)

    assert result.access_token

@pytest.mark.asyncio
async def test_register_route(db_session):
    req = RegisterRequest(
        email="kyle@mystmarket.com",
        name="kyle"
    )
    result = await register_route(req=req, session=db_session)
    db_user = get_user_by_email(db_session, "kyle@mystmarket.com")

    assert result is None
    assert db_user.name == "kyle"

@pytest.mark.asyncio
async def test_post_set_password_email_route():
    pass

@pytest.mark.asyncio
async def test_patch_user_route(db_session):
    req = UserPatchRequest(
        name = "kyle"
    )
    db_user = get_user(db_session, 2)
    result = await patch_user_route(req=req, current_user=db_user, session=db_session )
    db_user = get_user(db_session,2)
    
    assert result.name == "kyle"
    assert db_user.name == "kyle"

@pytest.mark.asyncio
async def test_patch_user_password_route(db_session, client, app):
    req = UserPatchPasswordRequest(
        password = "new password"
    )
    res=Response()
    db_user = get_user(db_session, 2)
    result = await patch_user_password_route(req=req, res=res, current_user=db_user, session=db_session )
    db_user = get_user(db_session,2)

    assert result.access_token is not None
    assert verify_password("new password", db_user.password_hash)

@pytest.mark.asyncio
async def test_deactivate_user_route(db_session, client):
    res = Response()
    res.set_cookie(
        key="refresh_token",
        value="fake_token",
        max_age= 4 * 60 * 60,
    )
    db_user = get_user(db_session, 2)
    result = await deactivate_user_route(res=res, current_user=db_user, session=db_session)
    assert result is None

    db_user = get_user(db_session, 2)
    assert db_user.is_registered is False

    cookie = res.headers.get("set-cookie")
    assert cookie is not None
    assert "Max-Age=0" in cookie

@pytest.mark.asyncio
async def test_admin_deactivate_user_route(db_session, client):
    db_user = get_user(db_session, 2)
    result = await admin_deactivate_user_route(user_id=2, _=None, session=db_session)
    assert result is None

    db_user = get_user(db_session, 2)
    assert db_user.is_registered is False

"""