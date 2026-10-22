from unittest.mock import ANY, Mock

import pytest

from app.core.exceptions import AuthenticationException
from app.features.user import api as user_api_module
from tests.features.order.fixtures import (
    order_factory,
    order_summary_factory,
)
from tests.features.review.fixtures import review_factory
from tests.features.user.fixtures import (
    admin_search_params_factory,
    user_analytics_factory,
    user_factory,
    user_input_factory,
    user_patch_factory,
    user_record_factory,
)
from tests.utils import assert_error_response, get_response_cookie


@pytest.mark.medium
class GetUserReviewsHandler_test:
    def functionality_test(self, user_client, database):
        review = review_factory()
        database.review.get_for_user.return_value = [review]

        response = user_client.get("/user/me/reviews")

        assert response.status_code == 200
        assert response.json()["reviews"][0]["id"] == review.id
        database.review.get_for_user.assert_called_once_with(7)


@pytest.mark.medium
class GetUserOrderHandler_test:
    def functionality_test(self, user_client, database):
        order = order_factory(user_id=7)
        database.order.get.return_value = order

        response = user_client.get("/user/orders/12")

        assert response.status_code == 200
        assert response.json()["order"]["id"] == order.id
        database.order.get.assert_called_once_with(order.id)

    def rejects_an_order_owned_by_another_user_test(
        self,
        user_client,
        database,
    ):
        database.order.get.return_value = order_factory(user_id=99)

        response = user_client.get("/user/orders/12")

        assert_error_response(
            response,
            status_code=403,
            name="AuthorizationException",
            message="Order does not belong to user",
        )


@pytest.mark.medium
class GetUserOrdersHandler_test:
    def functionality_test(self, user_client, database):
        order = order_summary_factory()
        database.order.get_all.return_value = [order]

        response = user_client.get("/user/orders")

        assert response.status_code == 200
        assert response.json()["orders"][0]["id"] == order.id
        database.order.get_all.assert_called_once_with(user_id=7)


@pytest.mark.medium
class GetUserAnalyticsHandler_test:
    def functionality_test(self, user_client, database):
        analytics = user_analytics_factory(user_id=11)
        database.user.get_analytics.return_value = analytics

        response = user_client.get("/users/11/analytics")

        assert response.status_code == 200
        assert response.json()["user"]["id"] == analytics.id
        database.user.get_analytics.assert_called_once_with(11)


@pytest.mark.medium
class CreateUserHandler_test:
    def functionality_test(self, user_client, database, monkeypatch):
        created_user = user_record_factory(
            email="new-user@example.com",
            name="New User",
        )
        database.user.create.return_value = created_user
        send_email = Mock()
        monkeypatch.setattr(
            user_api_module,
            "send_set_password_email",
            send_email,
        )
        user_input = user_input_factory()

        response = user_client.post(
            "/user",
            json={
                "userInput": {
                    "email": user_input.email,
                    "name": user_input.name,
                },
            },
        )

        assert response.status_code == 201
        database.user.create.assert_called_once_with(
            email=user_input.email,
            name=user_input.name,
            is_registered=True,
        )
        send_email.assert_called_once_with(created_user)


@pytest.mark.medium
class PatchUserHandler_test:
    def functionality_test(self, user_client, database):
        updated_user = user_factory(
            email="updated@example.com",
            name="Updated User",
        )
        database.user.patch.return_value = updated_user
        user_patch = user_patch_factory()

        response = user_client.patch(
            "/user/me",
            json={
                "userInput": {
                    "email": user_patch.email,
                    "name": user_patch.name,
                },
            },
        )

        assert response.status_code == 200
        assert response.json()["user"]["id"] == updated_user.id
        database.user.patch.assert_called_once_with(
            7,
            email=user_patch.email,
            name=user_patch.name,
        )


@pytest.mark.high
class PatchUserPasswordHandler_test:
    def functionality_test(self, user_client, database, monkeypatch):
        updated_user = user_factory()
        database.user.patch.return_value = updated_user
        hash_password = Mock(return_value="new-password-hash")
        issue_tokens = Mock(return_value="new-access-token")
        monkeypatch.setattr(
            user_api_module,
            "hash_password",
            hash_password,
        )
        monkeypatch.setattr(
            user_api_module,
            "issue_tokens",
            issue_tokens,
        )

        response = user_client.patch(
            "/user/me/password",
            json={"password": "new-password"},
        )

        assert response.status_code == 200
        assert response.json()["accessToken"] == "new-access-token"
        database.user.patch.assert_called_once_with(
            7,
            password_hash="new-password-hash",
        )
        hash_password.assert_called_once_with("new-password")
        issue_tokens.assert_called_once_with(ANY, 7)


@pytest.mark.medium
class SendUserPasswordEmailHandler_test:
    def functionality_test(self, user_client, monkeypatch):
        user = user_record_factory()
        send_email = Mock()
        monkeypatch.setattr(
            user_api_module,
            "send_set_password_email",
            send_email,
        )

        response = user_client.post("/user/me/password-email")

        assert response.status_code == 200
        send_email.assert_called_once()
        assert send_email.call_args.args[0].id == user.id


@pytest.mark.medium
class DeleteUserHandler_test:
    def functionality_test(self, user_client, database):
        response = user_client.delete("/user/me")
        refresh_cookie = get_response_cookie(response, "refresh_token")

        assert response.status_code == 204
        database.user.delete.assert_called_once_with(7)
        assert refresh_cookie.value == ""
        assert refresh_cookie["max-age"] == "0"
        assert refresh_cookie["path"] == "/"


@pytest.mark.high
class AdminSearchUsersHandler_test:
    def functionality_test(self, user_client, database):
        user = user_analytics_factory()
        database.user.search.return_value = ([user], True)
        params = admin_search_params_factory()

        response = user_client.post(
            "/users/search-admin",
            json={
                "searchParams": {
                    "isAscending": params.is_ascending,
                    "sortBy": params.sort_by.value,
                    "search": params.search,
                    "registration": [
                        registration.value
                        for registration in params.registration
                    ],
                },
                "limit": 10,
                "offset": 2,
            },
        )

        assert response.status_code == 200
        assert response.json()["users"][0]["id"] == user.id
        assert response.json()["hasMore"] is True
        database.user.search.assert_called_once_with(
            search="test",
            registrations=["registered", "guest"],
            sort_by="alphabet",
            is_ascending=False,
            limit=10,
            offset=2,
        )
