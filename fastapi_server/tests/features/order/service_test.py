from types import SimpleNamespace
from unittest.mock import Mock

import pytest
import stripe

from app.core.exceptions import AppError
from app.features.order import service as order_service
from app.features.order.schema import Status
from tests.features.item.fixtures import item_resolution_factory
from tests.features.order.fixtures import (
    order_factory,
    stripe_session_factory,
)
from tests.features.user.fixtures import user_factory


@pytest.mark.medium
class CreateStripeSession_test:
    def functionality_test(self, configured_order, monkeypatch):
        order = order_factory()
        item = item_resolution_factory()
        session = SimpleNamespace(url="https://stripe.test/session")
        create_session = Mock(return_value=session)
        monkeypatch.setattr(
            order_service.stripe.checkout.Session,
            "create",
            create_session,
        )

        result = order_service.create_stripe_session(order, [item])

        assert result == session.url
        create_session.assert_called_once_with(
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "product_data": {"name": "Battle Axe"},
                        "unit_amount": 2000,
                    },
                    "quantity": 2,
                },
            ],
            success_url="http://localhost:5173/success",
            cancel_url="http://localhost:5173/checkout",
            client_reference_id="8",
            metadata={"order_id": "12"},
        )

    def stripe_failure_raises_app_error_test(
        self,
        configured_order,
        monkeypatch,
    ):
        monkeypatch.setattr(
            order_service.stripe.checkout.Session,
            "create",
            Mock(side_effect=stripe.error.StripeError("provider error")),
        )

        with pytest.raises(AppError, match="Unable to create payment session"):
            order_service.create_stripe_session(
                order_factory(),
                [item_resolution_factory()],
            )

    def missing_session_url_raises_app_error_test(
        self,
        configured_order,
        monkeypatch,
    ):
        monkeypatch.setattr(
            order_service.stripe.checkout.Session,
            "create",
            Mock(return_value=SimpleNamespace(url=None)),
        )

        with pytest.raises(
            AppError,
            match="Payment provider did not return a session URL",
        ):
            order_service.create_stripe_session(
                order_factory(),
                [item_resolution_factory()],
            )


@pytest.mark.low
class GetOrderId_test:
    def functionality_test(self):
        session = stripe_session_factory(order_id=42)

        assert order_service._get_order_id(session) == 42

    def missing_metadata_raises_app_error_test(self):
        with pytest.raises(
            AppError,
            match="Stripe session is missing order metadata",
        ):
            order_service._get_order_id({})

    def invalid_metadata_raises_app_error_test(self):
        with pytest.raises(
            AppError,
            match="Stripe session has an invalid order ID",
        ):
            order_service._get_order_id(
                {"metadata": {"order_id": "not-an-id"}}
            )


@pytest.mark.high
class HandleSuccessfulPayment_test:
    def functionality_test(self, database, monkeypatch):
        order = order_factory(status=Status.pending)
        user = user_factory()
        session = stripe_session_factory(order_id=order.id)
        database.order.get.return_value = order
        database.user.get.return_value = user
        send_email = Mock()
        monkeypatch.setattr(
            order_service.resend.Emails,
            "send",
            send_email,
        )

        order_service.handle_successful_payment(database, session)

        database.order.patch_status.assert_called_once_with(
            order.id,
            Status.processing.value,
        )
        database.payment.create.assert_called_once_with(
            amount_cent=order.cost_aud_cent,
            reference=session.payment_intent,
            provider="stripe",
            currency_code=36,
            status="paid",
            order_id=order.id,
            user_id=order.user_id,
        )
        send_email.assert_called_once()
        assert send_email.call_args.args[0]["to"] == user.email

    def does_not_reprocess_completed_order_test(self, database, monkeypatch):
        order = order_factory(status=Status.processing)
        database.order.get.return_value = order
        database.user.get.return_value = user_factory()
        monkeypatch.setattr(
            order_service.resend.Emails,
            "send",
            Mock(),
        )

        order_service.handle_successful_payment(
            database,
            stripe_session_factory(order.id),
        )

        database.order.patch_status.assert_not_called()
        database.payment.create.assert_called_once()

    def email_failure_is_logged_without_raising_test(
        self,
        database,
        monkeypatch,
    ):
        order = order_factory()
        database.order.get.return_value = order
        database.user.get.return_value = user_factory()
        logger = SimpleNamespace(
            resend=SimpleNamespace(error=Mock()),
        )
        monkeypatch.setattr(order_service, "get_logger", lambda: logger)
        monkeypatch.setattr(
            order_service.resend.Emails,
            "send",
            Mock(side_effect=RuntimeError("email failed")),
        )

        order_service.handle_successful_payment(
            database,
            stripe_session_factory(order.id),
        )

        logger.resend.error.assert_called_once()


@pytest.mark.high
class HandleFailedPayment_test:
    def functionality_test(self, database, monkeypatch):
        order = order_factory(status=Status.pending)
        user = user_factory()
        database.order.get.return_value = order
        database.user.get.return_value = user
        send_email = Mock()
        monkeypatch.setattr(
            order_service.resend.Emails,
            "send",
            send_email,
        )

        order_service.handle_failed_payment(
            database,
            stripe_session_factory(order.id),
        )

        database.order.patch_status.assert_called_once_with(
            order.id,
            Status.error.value,
        )
        send_email.assert_called_once()
        assert send_email.call_args.args[0]["to"] == user.email

    def does_not_change_non_pending_order_test(
        self,
        database,
        monkeypatch,
    ):
        order = order_factory(status=Status.error)
        database.order.get.return_value = order
        database.user.get.return_value = user_factory()
        monkeypatch.setattr(
            order_service.resend.Emails,
            "send",
            Mock(),
        )

        order_service.handle_failed_payment(
            database,
            stripe_session_factory(order.id),
        )

        database.order.patch_status.assert_not_called()
