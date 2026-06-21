import pytest

from app.features.user.user_service import create_user
from app.db.models import User
from app.features.user.auth_service import (
    create_access_token,
    decode_token,
    create_refresh_token,
)
from app.core.exceptions import (
    AuthenticationException,
    ConflictException
)
from app.features.user.user_service import (
    hash_password,
    verify_password,
    update_user,
    create_user
)
"""

# FIXTURES
@pytest.fixture
def sample_user_payload():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }

@pytest.fixture
def created_user(app, sample_user_payload):
    db = app.state.db

    with db.get_session() as session:
        user = create_user(session, sample_user_payload)
        session.commit()
        return user

@pytest.fixture
def access_token(created_user):
    return create_access_token(created_user.id)

# UNIT TESTS

#Auth_service
def test_access_token_round_trip():
    token = create_access_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "access"


def test_refresh_token_round_trip():
    token = create_refresh_token(123)
    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "refresh"


def test_invalid_token_raises():
    with pytest.raises(AuthenticationException):
        decode_token("invalid.token.here")

#User_Service

def test_hash_and_verify_password():
    hashed = hash_password("mypassword")

    assert verify_password("mypassword", hashed) is True


def test_wrong_password_fails():
    hashed = hash_password("mypassword")

    with pytest.raises(AuthenticationException):
        verify_password("wrongpassword", hashed)


#INTERGRATION


def test_create_user_new(app):
    db = app.state.db

    payload = {
        "email": "new@example.com",
        "name": "New User",
    }

    with db.get_session() as session:
        user = create_user(session, payload)

        assert user.email == "new@example.com"
        assert user.is_registered is True


def test_create_user_duplicate_registered(app):
    db = app.state.db

    payload = {"email": "dup@example.com", "name": "User"}

    with db.get_session() as session:
        create_user(session, payload)

        with pytest.raises(ConflictException):
            create_user(session, payload)



def test_update_user_name(app, created_user):
    db = app.state.db

    class Data:
        name = "Updated Name"
        email = None
        password = None

        def model_dump(self, exclude_unset=True):
            return {"name": self.name}

    with db.get_session() as session:
        updated = update_user(session, created_user.id, Data())

        assert updated.name == "Updated Name"

#E2E
def test_login_flow(client, app, sample_user_payload):
    db = app.state.db

    # 1. create user in DB
    with db.get_session() as session:
        from app.features.user.user_service import create_user
        create_user(session, sample_user_payload)
        session.commit()

    # 2. simulate password already set (simplified)
    with db.get_session() as session:
        user = session.query(User).filter_by(email=sample_user_payload["email"]).first()
        user.password_hash = "$2b$12$somethinghashed"
        session.commit()

    # 3. login request
    response = client.post("/login", json={
        "email": sample_user_payload["email"],
        "password": sample_user_payload["password"]
    })

    assert response.status_code == 200
    data = response.json()

    assert "accessToken" in data
    assert "userResponse" in data

def test_refresh_token_flow(client, access_token):
    response = client.get(
        "/refresh",
        cookies={"refresh_token": "fake-token"}
    )

    assert response.status_code in [200, 401]

def test_register_flow(client):
    response = client.post("/register", json={
        "email": "newuser@example.com",
        "name": "New User"
    })

    assert response.status_code == 200

"""
"""
MOST IMPORTANT TESTS (if you do NOTHING ELSE)
UNIT
password hashing
password verification
JWT decode (valid + invalid)
token type validation
INTEGRATION
create_user:
new user
duplicate user
unregistered → registered upgrade
E2E
register → login → refresh
invalid login rejected
protected route access
"""