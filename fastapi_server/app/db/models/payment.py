from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .user import User
    from .order import Order


class Payment(Base):
    __tablename__ = "payment"
    __table_args__ = (
        Index('ix_payment_order_id', 'order_id'),
        Index('ix_payment_user_id', 'user_id'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)

    amount_cent: Mapped[int] = mapped_column(Integer)

    reference: Mapped[str] = mapped_column(Text)

    provider: Mapped[str] = mapped_column(Text)

    currency_code: Mapped[int] = mapped_column(Integer)

    status: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column()
    updated_at: Mapped[datetime] = mapped_column()

    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    order: Mapped["Order"] = relationship("Order", back_populates="payments")
    user: Mapped["User"] = relationship("User", back_populates="payments")