from __future__ import annotations
from datetime import date
from sqlalchemy import Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship, Date
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .product import Product
    
class Sale(Base):
    __tablename__ = "sale"

    id: Mapped[int] = mapped_column(primary_key=True)

    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="order_products")
    start_at: Mapped[date] = mapped_column(Date, nullable=False)

    end_at: Mapped[date] = mapped_column(Date, nullable=False)

    name: Mapped[str] = mapped_column(Text, nullable=False)

    slug: Mapped[str] = mapped_column(Text, nullable=False)

    description: Mapped[str | None] = mapped_column(Text)

    products: Mapped[list["Product"]] = relationship(
        "Product",
        secondary="sale_product",
        back_populates="sales",
    )