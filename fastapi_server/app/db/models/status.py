from __future__ import annotations
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .order import Order

class Status(Base):
    __tablename__ = "status"
    __static__ = True

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(Text, nullable=False)

    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="status",
    )