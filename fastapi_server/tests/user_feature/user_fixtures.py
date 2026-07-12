import pytest
from datetime import datetime

from app.db.models import User
from app.features.user.user_service import hash_password

@pytest.fixture
def default_password():
    return "password"

@pytest.fixture
def normal_user(session):
    user = User(
        name="kyle",
        email="kyle@mail.com",
        is_registered=True,
        password_hash=hash_password("password"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def deactivated_user(session):
    user = User(
        name="mark",
        email="mark@mail.com",
        is_registered=False,
        password_hash=None,
        deleted_at=datetime.now()
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
