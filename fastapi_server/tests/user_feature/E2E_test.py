import pytest
from pydantic import BaseModel, EmailStr
from types import SimpleNamespace

from app.api.dependencies import get_set_password_user

from app.utils import pick
from app.features.user.auth_service import (
    create_set_password_token,
    create_access_token
)
from app.features.user.user_service import (
    verify_password,
    get_user,
    get_user_by_email,
    hash_password,
)


@pytest.fixture
def sample_user(persistant_db_session):
    user = SimpleNamespace(
        name="matt oak",
        email="matt@mail.com",
        password="MatOak1234",
        update_name="daniel oak"
    )

    user.to_dict = lambda *keys: {k: getattr(user, k) for k in keys}
    user.db_user = lambda: get_user_by_email(persistant_db_session, user.email)
    user.access_token = lambda: create_access_token(user.db_user().id)
    user.set_password_token = lambda: create_set_password_token(user.db_user().id)

    return user

@pytest.mark.usefixtures("persistant_db_session")
class user_flow_test:

    @pytest.mark.order(1)
    def register_test(self, client, sample_user):
        response = client.post(
            "/register", 
            json=sample_user.to_dict("name", "email")
        )
        assert response.status_code == 200
        assert sample_user.db_user() is not None

    @pytest.mark.order(2)
    def set_password_test(self, client, sample_user):
        response = client.patch(
            "/user/me/password",
            headers={"Authorization": f"Bearer {sample_user.set_password_token()}"},
            json=sample_user.to_dict("password")
        )
        assert response.status_code == 200
        data = response.json()
        assert client.cookies.get("refresh_token") is not None
        assert "accessToken" in data
        assert "userResponse" in data
        assert sample_user.db_user().password_hash is not None
        assert verify_password(sample_user.password, sample_user.db_user().password_hash)
        
    @pytest.mark.order(3)
    def logout_test(self, client):
        response = client.post(
            "/logout"
        )
        assert response.status_code == 200
        assert client.cookies.get("refresh_token") is None

    @pytest.mark.order(4)
    def login_test(self, client, sample_user):
        response = client.post(
            "/login", 
            json=sample_user.to_dict("password", "email")
        )
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert "userResponse" in data
        assert client.cookies.get("refresh_token") is not None
    
    @pytest.mark.order(5)
    def update_profile_test(self, client, sample_user):
        response = client.patch(
            "/user/me/", 
            headers={"Authorization": f"Bearer {sample_user.access_token()}"},
            json=sample_user.to_dict("update_name")
        )
        assert response.status_code == 200
        data = response.json()
        assert data
        assert sample_user.db_user().name == sample_user.name

    @pytest.mark.order(6)
    def delete_profile_test(self, client, sample_user):
        response = client.delete(
            "/user/me", 
            headers={"Authorization": f"Bearer {sample_user.access_token()}"},

        )
        assert response.status_code == 204
        assert sample_user.db_user().deleted_at is not None
    