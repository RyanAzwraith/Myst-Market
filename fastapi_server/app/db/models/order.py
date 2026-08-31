from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from app.features.order.schema import Status

from ..database import Base

if TYPE_CHECKING:
    from .user import User
    from .address import Address
    from .item import OrderProduct
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

    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now())

    cost_aud_cent: Mapped[int] = mapped_column(Integer)

    sent_at: Mapped[datetime | None] = mapped_column()

    delivery_note: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    address: Mapped["Address"] = relationship("Address", back_populates="orders")

    order_products: Mapped[list["OrderProduct"]] = relationship("OrderProduct", back_populates="order")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="order")