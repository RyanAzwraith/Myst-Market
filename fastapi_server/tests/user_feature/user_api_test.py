import pytest
from fastapi import Response

from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
)
from app.features.user.auth_service import (
    create_refresh_token
)
from app.features.user.user_service import (
    verify_password,
    get_user,
    get_user_by_email,
    hash_password
)
from app.features.user.user_api import (
    LoginRequest,
    login_route,
    logout_route,
    refresh_route,
    RegisterRequest,
    register_route,
    post_set_password_email_route,
    UserPatchRequest,
    patch_user_route,
    UserPatchPasswordRequest,
    patch_user_password_route,
    deactivate_user_route,
    admin_deactivate_user_route
)

@pytest.fixture
def refresh_cookie_factory(user):
    def factory(
        res,
        key = "refresh_token",
        value = create_refresh_token(user.id),
        max_age = 4 * 60 * 60
    ):
        res.set_cookie(key, value, max_age)
        return res
    return factory

class login_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user, default_password):
        req = LoginRequest(email=user.email, password=default_password)
        res = Response()
        result = await login_route(req=req, res=res, session=session)

        assert result.access_token is not None
        assert result.userResponse.email == user.email

        cookies = res.headers.getlist("set-cookie")
        assert any("refresh_token=" in c for c in cookies)

    @pytest.mark.asyncio
    async def incorrect_password_test(self, session, user):
        req = LoginRequest(email=user.email, password="wrong password")
        res = Response()
        with pytest.raises(AuthenticationException):
            await login_route(req=req, res=res, session=session )
    
    @pytest.mark.asyncio
    async def non_existant_email_test(self, session, default_password):
        req = LoginRequest(email="rando@mail.com", password=default_password)

        res = Response()
        with pytest.raises(AuthenticationException):
            await login_route(req=req, res=res, session=session )

    @pytest.mark.asyncio
    async def deactivated_user_test(self, session, deactivated_user, default_password):
        req = LoginRequest(email=deactivated_user.email, password=default_password)
        res = Response()
        with pytest.raises(AuthenticationException):
            await login_route(req=req, res=res, session=session )

class logout_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, refresh_cookie_factory):
        res = refresh_cookie_factory(Response()) 
        result = await logout_route(res=res)
        assert result is None
        cookies = res.headers.getlist("set-cookie")
        assert any("Max-Age=0" in c for c in cookies)

class refresh_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        token = create_refresh_token(user.id)
        result = await refresh_route(refresh_token=token, session=session)
        assert result.access_token

    @pytest.mark.asyncio
    async def missing_refresh_token_test(self, session):
        with pytest.raises(AuthenticationException):
            await refresh_route(refresh_token=None, session=session)

    @pytest.mark.asyncio
    async def invalid_refresh_token_test(self, session):
        token="invalid_refresh_token"
        with pytest.raises(AuthenticationException):
            await refresh_route(refresh_token=token, session=session)
    
    @pytest.mark.asyncio
    async def deactivated_user_test(self, session, deactivated_user):
        token=create_refresh_token(deactivated_user.id)
        with pytest.raises(ConflictException):
            await refresh_route(refresh_token=token, session=session)

class register_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session):
        email = "mike@mail.com"
        name="mike"
        req = RegisterRequest(email=email, name=name)
        result = await register_route(req=req, session=session)
        db_user = get_user_by_email(session, email)
        assert result is None
        assert db_user.name == name

class post_set_password_email_route:
        pass

class patch_user_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        name = "dan"
        req = UserPatchRequest(name=name)
        result = await patch_user_route(req=req, current_user=user, session=session )
        db_user = get_user(session, user.id)
        
        assert result.name == name
        assert db_user.name == name

class patch_user_password_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        password = "new password"
        req = UserPatchPasswordRequest(password=password)
        res=Response()
        result = await patch_user_password_route(req=req, res=res, current_user=user, session=session )
        db_user = get_user(session, user.id)

        assert result.access_token is not None
        assert verify_password(password, db_user.password_hash)

class deactivate_user_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user, refresh_cookie_factory):
        res = refresh_cookie_factory(Response())
        result = await deactivate_user_route(res=res, current_user=user, session=session)
        assert result is None

        db_user = get_user(session, user.id)
        assert db_user.is_registered is False

        cookies = res.headers.getlist("set-cookie")
        assert any("Max-Age=0" in c for c in cookies)

class admin_deactivate_user_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        result = await admin_deactivate_user_route(user_id=user.id, _=None, session=session)
        assert result is None

        db_user = get_user(session, user.id)
        assert db_user.is_registered is False

    