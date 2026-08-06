import pytest
from datetime import datetime

from app.db.models import User
from app.features.user.user_service import hash_password

@pytest.fixture
def default_password():
    return "password"


@pytest.fixture
def user_factory(
    session
) :
    def create_user( *,
        name="kyle",
        email="kyle@mail.com",
        is_registered=True,
        password_hash=hash_password("password"),
    ):
        user_entity = User(
            name=name,
            email=email,
            is_registered=is_registered,
            password_hash=password_hash,
        )
        session.add(user_entity)
        session.commit()
        session.refresh(user_entity)
        return user_entity
    return create_user

@pytest.fixture
def user(session, user_factory):
    return user_factory()

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


@pytest.fixture
def user_seed(user_factory):
    user_entities = [
        user_factory( 
            name='jake', email='jake@mail.com' 
        ),
        user_factory( 
            name='don', email='don@mail.com' 
        ),
        user_factory( 
            name='mike', email='mike@mail.com', is_registered = False 
        ),
    ]
    return user_entities

