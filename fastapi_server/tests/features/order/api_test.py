from unittest.mock import Mock

import pytest

from app.features.order import api as order_api_module
from tests.features.item.fixtures import item_resolution_factory
from tests.features.order.fixtures import (
    address_factory,
    admin_search_params_factory,
    order_factory,
    order_summary_factory,
)
from tests.features.user.fixtures import user_factory
from tests.utils import assert_error_response


def create_order_payload(include_user: bool = True):
    payload = {
        "items": [
            {
                "productId": 11,
                "quantity": 2,
            },
        ],
        "address": {
            "countryCode": "AU",
            "postcode": "3000",
            "state": "VIC",
            "city": "Melbourne",
            "street": "1 Test Street",
        },
        "deliveryNote": "Leave at the front door",
        "isCreatingAccount": True,
    }
    if include_user:
        payload["user"] = {
            "email": "guest@example.com",
            "name": "Guest User",
        }
    else:
        payload["user"] = None
    return payload


@pytest.mark.medium
class GetOrderByIdHandler_test:
    def functionality_test(self, order_client, database):
        order = order_factory()
        database.order.get.return_value = order
        database.user.get.return_value = user_factory(user_id=8)

        response = order_client.get("/orders/12")

        assert response.status_code == 200
        assert response.json()["order"]["id"] == order.id
        assert response.json()["user"]["id"] == order.user_id
        database.order.get.assert_called_once_with(order.id)
        database.user.get.assert_called_once_with(order.user_id)

    def rejects_an_order_owned_by_another_user_test(
        self,
        order_client,
        database,
    ):
        database.order.get.return_value = order_factory(user_id=99)

        response = order_client.get("/orders/12")

        assert_error_response(
            response,
            status_code=403,
            name="AuthorizationException",
            message="Order does not belong to user",
        )


@pytest.mark.high
class CreateOrderHandler_test:
    def functionality_test(self, order_client, database, monkeypatch):
        resolved_items = [item_resolution_factory()]
        order = order_factory()
        database.item.resolve.return_value = (resolved_items, 4000)
        database.user.create.return_value = user_factory(
            user_id=8,
            email="guest@example.com",
            name="Guest User",
        )
        database.order.create_with_items.return_value = order
        create_session = Mock(return_value="https://stripe.test/session")
        send_email = Mock()
        monkeypatch.setattr(
            order_api_module,
            "create_stripe_session",
            create_session,
        )
        monkeypatch.setattr(
            order_api_module,
            "send_set_password_email",
            send_email,
        )

        response = order_client.post(
            "/order",
            json=create_order_payload(),
        )

        assert response.status_code == 201
        assert response.json()["stripeSessionUrl"] == (
            "https://stripe.test/session"
        )
        database.user.create.assert_called_once_with(
            email="guest@example.com",
            name="Guest User",
            is_registered=True,
        )
        database.order.create_with_items.assert_called_once()
        call = database.order.create_with_items.call_args.kwargs
        assert call["user_id"] == 8
        assert call["items"] == resolved_items
        assert call["status"] == "pending"
        assert call["cost_aud_cent"] == 4000
        assert call["delivery_note"] == "Leave at the front door"
        send_email.assert_called_once()
        create_session.assert_called_once_with(order, resolved_items)

    def authenticated_user_skips_user_creation_test(
        self,
        order_app,
        order_client,
        database,
        monkeypatch,
    ):
        current_user = user_factory()
        order_app.dependency_overrides[
            order_api_module.get_optional_user
        ] = lambda: current_user
        database.item.resolve.return_value = (
            [item_resolution_factory()],
            4000,
        )
        database.order.create_with_items.return_value = order_factory()
        monkeypatch.setattr(
            order_api_module,
            "create_stripe_session",
            Mock(return_value="https://stripe.test/session"),
        )
        send_email = Mock()
        monkeypatch.setattr(
            order_api_module,
            "send_set_password_email",
            send_email,
        )

        response = order_client.post(
            "/order",
            json={
                **create_order_payload(include_user=False),
                "isCreatingAccount": False,
            },
        )

        assert response.status_code == 201
        database.user.create.assert_not_called()
        send_email.assert_not_called()

    def guest_without_user_details_returns_request_error_test(
        self,
        order_client,
        database,
    ):
        database.item.resolve.return_value = ([], 0)

        response = order_client.post(
            "/order",
            json=create_order_payload(include_user=False),
        )

        assert_error_response(
            response,
            status_code=400,
            name="RequestException",
            message="User details are required",
        )


@pytest.mark.medium
class PatchOrderStatusHandler_test:
    def functionality_test(self, order_client, database):
        response = order_client.patch(
            "/orders/12/status",
            json={"status": "shipped"},
        )

        assert response.status_code == 204
        database.order.patch_status.assert_called_once_with(
            12,
            "shipped",
        )


@pytest.mark.medium
class GetRecentOrdersHandler_test:
    def functionality_test(self, order_client, database):
        order = order_factory()
        database.order.get_recent.return_value = [order]

        response = order_client.get("/orders/recent")

        assert response.status_code == 200
        assert response.json()["orders"][0]["id"] == order.id
        database.order.get_recent.assert_called_once_with()


@pytest.mark.high
class AdminSearchOrdersHandler_test:
    def functionality_test(self, order_client, database):
        order = order_summary_factory()
        database.order.search_admin.return_value = ([order], True)
        params = admin_search_params_factory()

        response = order_client.post(
            "/orders/search-admin",
            json={
                "searchParams": {
                    "searchName": params.search_name,
                    "status": [
                        status.value for status in params.status
                    ],
                    "sort": params.sort.value,
                    "isAscending": params.is_ascending,
                },
                "limit": 10,
                "offset": 2,
            },
        )

        assert response.status_code == 200
        assert response.json()["orders"][0]["id"] == order.id
        assert response.json()["hasMore"] is True
        database.order.search_admin.assert_called_once_with(
            search_name="Test User",
            statuses=["pending", "processing"],
            sort_by="cost",
            is_ascending=False,
            limit=10,
            offset=2,
        )


@pytest.mark.medium
class PatchOrdersStatusHandler_test:
    def functionality_test(self, order_client, database):
        response = order_client.patch(
            "/orders/status",
            json={
                "orderIds": [12, 13],
                "status": "cancelled",
            },
        )

        assert response.status_code == 204
        database.order.patch_statuses.assert_called_once_with(
            [12, 13],
            "cancelled",
        )


@pytest.mark.medium
class StripeWebhook_test:
    def functionality_test(
        self,
        order_client,
        database,
        monkeypatch,
    ):
        event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "payment_status": "paid",
                },
            },
        }
        construct_event = Mock(return_value=event)
        handle_success = Mock()
        monkeypatch.setattr(
            order_api_module.stripe.Webhook,
            "construct_event",
            construct_event,
        )
        monkeypatch.setattr(
            order_api_module,
            "handle_successful_payment",
            handle_success,
        )

        response = order_client.post(
            "/stripe/payment",
            content=b"payload",
            headers={"stripe-signature": "signature"},
        )

        assert response.status_code == 200
        assert response.json() == {"received": True}
        construct_event.assert_called_once()
        handle_success.assert_called_once_with(
            database,
            event["data"]["object"],
        )

    def missing_signature_returns_request_error_test(self, order_client):
        response = order_client.post(
            "/stripe/payment",
            content=b"payload",
        )

        assert_error_response(
            response,
            status_code=400,
            name="RequestException",
            message="Missing Stripe signature",
        )

    def invalid_payload_returns_request_error_test(
        self,
        order_client,
        monkeypatch,
    ):
        monkeypatch.setattr(
            order_api_module.stripe.Webhook,
            "construct_event",
            Mock(side_effect=ValueError("invalid payload")),
        )

        response = order_client.post(
            "/stripe/payment",
            content=b"payload",
            headers={"stripe-signature": "signature"},
        )

        assert_error_response(
            response,
            status_code=400,
            name="RequestException",
            message="Invalid Stripe payload",
        )

    def failed_payment_routes_to_failure_handler_test(
        self,
        order_client,
        database,
        monkeypatch,
    ):
        session = {"payment_status": "failed"}
        event = {
            "type": "checkout.session.async_payment_failed",
            "data": {"object": session},
        }
        monkeypatch.setattr(
            order_api_module.stripe.Webhook,
            "construct_event",
            Mock(return_value=event),
        )
        handle_failed = Mock()
        monkeypatch.setattr(
            order_api_module,
            "handle_failed_payment",
            handle_failed,
        )

        response = order_client.post(
            "/stripe/payment",
            content=b"payload",
            headers={"stripe-signature": "signature"},
        )

        assert response.status_code == 200
        handle_failed.assert_called_once_with(database, session)

    def unpaid_completed_payment_is_ignored_test(
        self,
        order_client,
        database,
        monkeypatch,
    ):
        event = {
            "type": "checkout.session.completed",
            "data": {"object": {"payment_status": "unpaid"}},
        }
        monkeypatch.setattr(
            order_api_module.stripe.Webhook,
            "construct_event",
            Mock(return_value=event),
        )
        handle_success = Mock()
        handle_failed = Mock()
        monkeypatch.setattr(
            order_api_module,
            "handle_successful_payment",
            handle_success,
        )
        monkeypatch.setattr(
            order_api_module,
            "handle_failed_payment",
            handle_failed,
        )

        response = order_client.post(
            "/stripe/payment",
            content=b"payload",
            headers={"stripe-signature": "signature"},
        )

        assert response.status_code == 200
        handle_success.assert_not_called()
        handle_failed.assert_not_called()
