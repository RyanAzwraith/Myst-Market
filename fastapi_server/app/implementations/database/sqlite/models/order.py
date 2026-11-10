from __future__ import annotations
from datetime import date
from sqlalchemy import Text, Integer, ForeignKey, Index, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.features.order.schema import Status

from ..Base import Base

if TYPE_CHECKING:
    from .user import User
    from .address import Address
    from .item import Item
    from .payment import Payment


class Order(Base):
    __tablename__ = "order"
    __table_args__ = (
        Index('ix_order_user_id', 'user_id'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    address_id: Mapped[int] = mapped_column(ForeignKey("address.id"))

    status: Mapped[str] = mapped_column(Text, nullable=False, default=Status.pending.value)

    created_at: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )
    updated_at: Mapped[date] = mapped_column(
        Date,
        nullable=True,
        default=date.today,
    )

    cost_aud_cent: Mapped[int] = mapped_column(Integer)

    sent_at: Mapped[date | None] = mapped_column(Date)

    delivery_note: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    address: Mapped["Address"] = relationship("Address", back_populates="orders")

    items: Mapped[list["Item"]] = relationship("Item", back_populates="order")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="order")