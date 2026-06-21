import pytest
from fastapi import Response
import jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr

from app.core import get_config
from app.db.models import User
from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
    ContentNotFoundException
)
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
from app.api.dependencies import get_set_password_user

""" 
# ==========================================
# auth_service
# ==========================================

def test_access_token():
    token = create_access_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "access"


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

def test_login_route(client):
    res = client.post("/login", json={
        "email": "customer@mystmarket.com",
        "password": "password"
    })

    data = res.json()

    assert res.status_code == 200
    assert "accessToken" in data
    assert "userResponse" in data
    assert "refresh_token=" in res.headers.get("set-cookie")

    res = client.post("/login", json={
        "email": "customer@mystmarket.com",
        "password": "not password"
    })

    assert res.status_code == 401

    res = client.post("/login", json={
        "email": "rando@mail.com",
        "password": "password"
    })

    assert res.status_code == 401

    res = client.post("/login", json={
        "email": "customer_two@mystmarket.com",
        "password": "password"
    })

    assert res.status_code == 401


def test_logout_route(client):
    client.cookies.set("refresh_token", "fake-refresh-token")

    res = client.post("/logout")

    assert res.status_code == 200
    assert "refresh_token=" in res.headers["set-cookie"]
    assert "Max-Age=0" in res.headers["set-cookie"]


def test_refresh_route(client):
    res = client.get("/refresh")
    assert res.status_code == 401

    client.cookies.set("refresh_token", "fake-refresh-token")

    res = client.get("/refresh")
    assert res.status_code == 401
    
    client.post("/login", json={
        "email": "customer@mystmarket.com",
        "password": "password"
    })

    res = client.get("/refresh")
    data = res.json()

    assert res.status_code == 200
    assert "accessToken" in data
    
    client.delete("/user/me")
    res = client.get("/refresh")
    assert res.status_code == 200
    
def test_register_route(db_session, client):
    res = client.post("/register", json={
        "email": "kyle@mystmarket.com",
        "name": "kyle"
    })

    db_user = get_user_by_email(db_session, "kyle@mystmarket.com")

    assert res.status_code == 200
    assert db_user.name == "kyle"


def test_post_set_password_email_route():
    pass


def test_patch_user_route(db_session, client):
    login = client.post("/login", json={
        "email": "customer@mystmarket.com",
        "password": "password"
    })

    token = login.json()["accessToken"]

    res = client.patch(
        "/user/me",
        json={"name": "kyle"},
        headers={"Authorization": f"Bearer {token}"}
    )

    db_user = get_user_by_email(db_session, "customer@mystmarket.com")

    assert res.status_code == 200
    assert db_user.name == "kyle"

    

def test_patch_user_password_route(db_session, client, app):
    app.dependency_overrides[get_set_password_user] = lambda: get_user(db_session, 2)

    res = client.patch("/user/me/password", json={
        "password": "new password"
    })

    db_user = get_user(db_session, 2)

    assert res.status_code == 200
    assert verify_password("new password", db_user.password_hash) is True

    app.dependency_overrides.clear()


def test_deactivate_user_route(db_session, client):
    login = client.post("/login", json={
        "email": "customer@mystmarket.com",
        "password": "password"
    })

    token = login.json()["accessToken"]

    res = client.delete(
        "/user/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    db_user = get_user(db_session, 2)

    assert res.status_code == 204
    assert db_user.is_registered is False
    assert "refresh_token=" in res.headers["set-cookie"]


def test_admin_deactivate_user_route(db_session, client):
    login = client.post("/login", json={
        "email": "admin@mystmarket.com",
        "password": "password"
    })

    token = login.json()["accessToken"]

    res = client.delete(
        "/users/2",
        headers={"Authorization": f"Bearer {token}"}
    )

    db_user = get_user(db_session, 2)

    assert res.status_code == 204
    assert db_user.is_registered is False


    """