from __future__ import annotations
from datetime import date
from sqlalchemy import Text, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..Base import Base

if TYPE_CHECKING:
    from .product import Product
    from .item import Item
    
class Sale(Base):
    __tablename__ = "sale"

    id: Mapped[int] = mapped_column(primary_key=True)

    discount_perc: Mapped[int] = mapped_column(Integer, nullable=False)

    start_at: Mapped[date] = mapped_column(Date, nullable=False)

    end_at: Mapped[date] = mapped_column(Date, nullable=False)

    name: Mapped[str] = mapped_column(Text, nullable=False)

    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)

    description: Mapped[str | None] = mapped_column(Text)

    products: Mapped[list["Product"]] = relationship(
        "Product",
        secondary="sale_product",
        back_populates="sales",
    )

    items: Mapped[list["Item"]] = relationship(
        "Item",
        back_populates="sale",
    )