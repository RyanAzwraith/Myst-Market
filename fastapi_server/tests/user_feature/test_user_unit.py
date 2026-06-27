import pytest
from fastapi import Response
import jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr

from app.db.models import User
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
class auth_service_test:
    class access_token_test:
        def round_trip_test(self):
            token = create_access_token(123)
            payload = decode_token(token)

            assert payload["sub"] == "123"
            assert payload["type"] == "access"

    class refresh_token_test:
        def round_trip_test(self):
            token = create_refresh_token(123)
            payload = decode_token(token)

            assert payload["sub"] == "123"
            assert payload["type"] == "refresh"


    class decode_token_test:
        
        def invalid_token_test(self):
            with pytest.raises(AuthenticationException):
                decode_token("invalid.token.here")

        @staticmethod
        def create_expired_token():
            payload = {
                "sub": "1",
                "type": "access",
                "exp": datetime.now(timezone.utc) - timedelta(hours=4),
            }
            return jwt.encode(payload, get_config().jwt_key, algorithm=ALGORITHM)
        
        def expired_token_test(self):
            token = self.create_expired_token()

            with pytest.raises(AuthenticationException):
                decode_token(token)

    class issue_tokens_test:
        def functionality_test(self):
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

    class create_set_password_token_test:
        def round_trip_test(self):
            token = create_set_password_token(123)
            payload = decode_token(token)

            assert payload["sub"] == "123"
            assert payload["type"] == "set_password"

    class send_set_password_email_test:
        pass

#=======================
# user_service
#=======================
class user_service_test:

    @pytest.fixture
    def example_user(db_session):
        user = User(
            name="kyle",
            email="kyle@mail.com",
            is_registereed=True,
            password_hasd=hash_password("password"),
        )
        db_session.add(user)
        db_session.commit
        db_session.refresh()
        return user


    @pytest.fixture
    def example_deaticated_user(db_session):
        user = User(
            name="mark",
            email="mark@mail.com",
            is_registereed=False,
            password_hasd=None,
            deleted_at=datetime.now()
        )
        db_session.add(user)
        db_session.commit
        db_session.refresh()
        return user


    class hash_password_test:
        def round_trip_test(self):
            hashed = hash_password("password")
            is_verified = verify_password("password", hashed)

            assert hashed
            assert len(hashed) == 60
            assert is_verified is True

    class verify_password_test:
        def incorrect_password_test(self):
            hashed = hash_password("password")
            with pytest.raises(AuthenticationException):
                verify_password("not password", hashed)

    class get_user_test:
        def functionality_test(self, db_session, example_user):
            db_user = get_user(db_session, example_user.id)

            assert db_user
            assert db_user.id == example_user.id

        def missing_user(self, db_session):
            with pytest.raises(ContentNotFoundException):
                get_user(db_session, 55)

    class get_user_by_email_test:
        def functionality_test(self, db_session, example_user):
            db_user = get_user_by_email(db_session, example_user.email)

            assert db_user
            assert db_user.id == example_user.id

        def missing_user(self, db_session):
            with pytest.raises(ContentNotFoundException):
                get_user_by_email(db_session, "rando@mail.com")

    class create_user_test:

        class ExampleData(BaseModel):
            name:EmailStr
            email:str

        example_data_instance = ExampleData(
            name="adam",
            email="adam@mystmarket.com"
        )

        def functionality_test(self, db_session):
            db_user = create_user( db_session, self.example_data_instance)

            assert isinstance(db_user, User)
            assert db_user.id
            assert db_user.email == self.example_data_instance.email
            assert db_user.is_registered is True
            assert db_user.password_hash is None
            assert db_user.is_admin is False
            assert db_user.created_at
            assert db_user.deleted_at is None

        def already_exists_test(self, db_session, ExampleUser):
            with pytest.raises(ConflictException):
                create_user( db_session,self.ExampleData(**ExampleUser))

        def reactivativation_test(self, db_session, example_deactivated_user):
            db_user = create_user(db_session,self.ExampleData(**example_deactivated_user, is_registered=True))

            assert db_user.email == example_deactivated_user.email
            assert db_user.id == example_deactivated_user.id
            assert db_user.is_registered is True
            assert db_user.deleted_at is not None

    class update_user_test:
        
        class ExampleData(BaseModel):
            name: str | None
            email: EmailStr | None
            password: str| None

        example_data_instance = ExampleData(
            name = "ben",
            email = "ben@mail.com",
            password = "new password"
        )

        def functionality_test(self, db_session, example_user):
            db_user = update_user(db_session, example_user.id, self.example_data_instance)

            assert db_user.name == self.example_data_instance.name

            db_user = get_user(db_session, example_user.id)

            assert db_user.name == self.example_data_instance.name
            assert db_user.email == self.example_data_instance.email
            assert verify_password(self.example_data_instance.password, db_user.password_hash) is True
            assert db_user.is_registered is True

        example_blank_data_instance = ExampleData(name=" ")

        def blank_string_test(self, db_session, example_user):
            db_user = update_user(db_session, example_user, self.ExampleDataData)
            assert db_user.name == example_user.name

    class deactivate_user_test:
        def functionality_test(self, db_session, example_user):
            deactivate_user(db_session, example_user.id)
            db_user = get_user(db_session, example_user.id)
            assert db_user.email
            assert db_user.name is None
            assert db_user.password_hash is None
            assert db_user.is_registered is False
            assert db_user.is_admin is False
            assert db_user.deleted_at is not None



# ==========================================
# user_api
# ==========================================
class user_api_test:

    class login_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session, example_user):
            req = LoginRequest(**example_user)
            res = Response()
            result = await login_route(req=req, res=res, session=db_session)

            assert result.access_token is not None
            assert result.userResponse.email == example_user.email
        
            cookie = res.headers.get("set-cookie")
            assert cookie is not None
            assert "refresh_token=" in cookie

        @pytest.mark.asyncio
        async def incorrect_password_test(self, db_session, example_user):
            req = LoginRequest( **example_user, password="wrong password")
            res = Response()
            with pytest.raises(AuthenticationException):
                await login_route(req=req, res=res, session=db_session )
        
        @pytest.mark.asyncio
        async def non_existant_email_test(self, db_session, example_user):
            req = LoginRequest( **example_user, email="rando@mail.com")
            res = Response()
            with pytest.raises(AuthenticationException):
                await login_route(req=req, res=res, session=db_session )

        @pytest.mark.asyncio
        async def deactivated_user_test(self, db_session, deactivated_user_example):
            req = LoginRequest( **deactivated_user_example)
            res = Response()
            with pytest.raises(AuthenticationException):
                await login_route(req=req, res=res, session=db_session )

    class logout_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self):
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

    class ExampleCookie(BaseModel):
        key:str="refresh_token"
        value=create_refresh_token(1),
        max_age= 4 * 60 * 60,

    class refresh_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session):
            res = Response()
            res.set_cookie(
                key="refresh_token",
                value=create_refresh_token(2),
                max_age= 4 * 60 * 60,
            )
            result = await refresh_route(res=res, session=db_session)

            assert result.access_token

        @pytest.mark.asyncio
        async def missing_refresh_token_test(self, db_session):
            res = Response()
            with pytest.raises(AuthenticationException):
                result = await refresh_route(res=res, session=db_session)

        @pytest.mark.asyncio
        async def invalid_refresh_token_test(self, db_session):
            res = Response()
            res.set_cookie(
                key="refresh_token",
                value="invalid_refresh_token",
                max_age= 4 * 60 * 60,
            )
            with pytest.raises(AuthenticationException):
                result = await refresh_route(res=res, session=db_session)
        
        @pytest.mark.asyncio
        async def deactivated_user_test(self, db_session):
            res = Response()
            res.set_cookie(
                key="refresh_token",
                value=create_refresh_token(3),
                max_age= 4 * 60 * 60,
            )
            with pytest.raises(ConflictException):
                result = await refresh_route(res=res, session=db_session)

    class register_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session):
            req = RegisterRequest(
                email="kyle@mystmarket.com",
                name="kyle"
            )
            result = await register_route(req=req, session=db_session)
            db_user = get_user_by_email(db_session, "kyle@mystmarket.com")

            assert result is None
            assert db_user.name == "kyle"

    class post_set_password_email_route:
            pass

    class patch_user_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session):
            req = UserPatchRequest(
                name = "kyle"
            )
            db_user = get_user(db_session, 2)
            result = await patch_user_route(req=req, current_user=db_user, session=db_session )
            db_user = get_user(db_session,2)
            
            assert result.name == "kyle"
            assert db_user.name == "kyle"

    class patch_user_password_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session, client, app):
            req = UserPatchPasswordRequest(
                password = "new password"
            )
            res=Response()
            db_user = get_user(db_session, 2)
            result = await patch_user_password_route(req=req, res=res, current_user=db_user, session=db_session )
            db_user = get_user(db_session,2)

            assert result.access_token is not None
            assert verify_password("new password", db_user.password_hash)

    class deactivate_user_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session, client):
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

    class admin_deactivate_user_route_test:
        @pytest.mark.asyncio
        async def functionality_test(self, db_session):
            db_user = get_user(db_session, 2)
            result = await admin_deactivate_user_route(user_id=2, _=None, session=db_session)
            assert result is None

            db_user = get_user(db_session, 2)
            assert db_user.is_registered is False

        