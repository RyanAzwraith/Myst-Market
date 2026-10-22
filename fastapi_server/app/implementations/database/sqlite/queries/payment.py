from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException
from app.interfaces.database_schemas.Payment import (
    Payment as PaymentInterface,
)

from ..common import get_model
from ..models.order import Order as OrderModel
from ..models.payment import Payment as PaymentModel
from ..models.user import User as UserModel


class SqlitePayment(PaymentInterface):
    def __init__(self, session: Session):
        self._session = session

    def create(
        self,
        amount_cent: int,
        reference: str,
        provider: str,
        currency_code: int,
        status: str | None,
        order_id: int,
        user_id: int,
    ) -> None:
        
        get_model(
            self._session,
            OrderModel,
            "Order",
            order_id,
        )
        get_model(
            self._session,
            UserModel,
            "User",
            user_id,
        )

        existing_payment = self._session.scalar(
            select(PaymentModel).where(
                PaymentModel.reference == reference,
            )
        )
        if existing_payment is not None:
            raise ConflictException(
                "Payment with reference already exists",
                details={"payment_reference": reference},
            )

        payment = PaymentModel(
            amount_cent=amount_cent,
            reference=reference,
            provider=provider,
            currency_code=str(currency_code),
            status=status,
            order_id=order_id,
            user_id=user_id,
        )
        self._session.add(payment)
        self._session.commit()
