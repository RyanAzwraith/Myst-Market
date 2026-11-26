import pytest

from app.core.exceptions import ConflictException
from tests.implementations.database.sqlite.fixtures import (
    order_model_factory,
    payment_model_factory,
    user_model_factory,
)


@pytest.mark.medium
class SqlitePaymentCreate_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                order_model_factory(),
            ]
        )
        sqlite_session.commit()

        result = session_database.payment.create(
            amount_cent=4000,
            reference="pi_new",
            provider="stripe",
            currency_code=36,
            status="succeeded",
            order_id=1,
            user_id=1,
        )

        assert result is None
        payment = sqlite_session.get(
            type(payment_model_factory()),
            1,
        )
        assert payment.reference == "pi_new"
        assert payment.currency_code == "36"

    def rejects_duplicate_references_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                order_model_factory(),
                payment_model_factory(),
            ]
        )
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="reference already exists",
        ):
            session_database.payment.create(
                amount_cent=4000,
                reference="pi_test_123",
                provider="stripe",
                currency_code=36,
                status="succeeded",
                order_id=1,
                user_id=1,
            )
