import pytest
from pydantic import BaseModel, EmailStr

from app.db.models import User
from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
    ContentNotFoundException
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

class hash_password_test:
    def round_trip_test(self):
        password = 'password'
        hashed = hash_password(password)
        is_verified = verify_password(password, hashed)

        assert hashed
        assert len(hashed) == 60
        assert is_verified is True

class verify_password_test:
    def incorrect_password_test(self):
        password = "password"
        hashed = hash_password(password)
        with pytest.raises(AuthenticationException):
            verify_password("not password", hashed)

class get_user_test:
    def functionality_test(self, db_session, normal_user):
        db_user = get_user(db_session, normal_user.id)
        assert db_user
        assert db_user.id == normal_user.id

    def missing_user(self, db_session):
        with pytest.raises(ContentNotFoundException):
            get_user(db_session, 55)

class get_user_by_email_test:
    def functionality_test(self, db_session, normal_user):
        db_user = get_user_by_email(db_session, normal_user.email)
        assert db_user
        assert db_user.id == normal_user.id

    def missing_user(self, db_session):
        with pytest.raises(ContentNotFoundException):
            get_user_by_email(db_session, "rando@mail.com")

class create_user_test:

    class Data(BaseModel):
        name:str
        email:EmailStr

    def functionality_test(self, db_session):
        name="adam"
        email="adam@mystmarket.com"
        db_user = create_user( db_session, self.Data(name=name, email=email))

        assert isinstance(db_user, User)
        assert db_user.id is not None
        assert db_user.email == email
        assert db_user.is_registered is True
        assert db_user.password_hash is None
        assert db_user.is_admin is False
        assert db_user.created_at is not None
        assert db_user.deleted_at is None

    def already_exists_test(self, db_session, normal_user):
        with pytest.raises(ConflictException):
            create_user( db_session,self.Data(name=normal_user.name, email=normal_user.email))

    def reactivativation_test(self, db_session, deactivated_user):
        db_user = create_user(db_session, self.Data(email=deactivated_user.email, name=deactivated_user.name))

        assert db_user.email == deactivated_user.email
        assert db_user.id == deactivated_user.id
        assert db_user.is_registered is True
        assert db_user.deleted_at is not None

class update_user_test:
    
    class Data(BaseModel):
        name: str = None
        email: EmailStr = None
        password: str = None

    normal_data = Data(
        name = "ben",
        email = "ben@mail.com",
        password = "new password"
    )

    def functionality_test(self, db_session, normal_user):
        db_user = update_user(db_session, normal_user.id, self.normal_data)

        assert db_user.name == self.normal_data.name

        db_user = get_user(db_session, normal_user.id)

        assert db_user.name == self.normal_data.name
        assert db_user.email == self.normal_data.email
        assert verify_password(self.normal_data.password, db_user.password_hash) is True
        assert db_user.is_registered is True

    blank_data = Data(name=" ")

    def blank_string_test(self, db_session, normal_user):
        db_user = update_user(db_session, normal_user.id, self.blank_data)
        assert db_user.name == normal_user.name

class deactivate_user_test:
    def functionality_test(self, db_session, normal_user):
        deactivate_user(db_session, normal_user.id)
        db_user = get_user(db_session, normal_user.id)
        assert db_user.email
        assert db_user.name is None
        assert db_user.password_hash is None
        assert db_user.is_registered is False
        assert db_user.is_admin is False
        assert db_user.deleted_at is not None

