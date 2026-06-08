from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer, text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .address import Address
    from .order import Order
    from .review import Review
    from .payment import Payment


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(Text, nullable=False)

    is_admin: Mapped[int] = mapped_column(Integer, server_default=text("0"))

    is_registered: Mapped[int] = mapped_column(Integer, server_default=text("0"))

    name: Mapped[str | None] = mapped_column(Text)

    password_hash: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    deleted_at: Mapped[datetime | None] = mapped_column()

    addresses: Mapped[list["Address"]] = relationship("Address", back_populates="user")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="user")