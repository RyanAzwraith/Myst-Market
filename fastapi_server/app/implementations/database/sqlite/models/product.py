from __future__ import annotations
from sqlalchemy import Text, Integer, Index, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import TYPE_CHECKING

from app.features.product.schema import Category, Rarity

from ..Base import Base


if TYPE_CHECKING:
    from .sale import Sale
    from .review import Review
    from .item import Item
    from .stock import Stock


class Product(Base):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=Category.weapons.value,
    )

    rarity: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=Rarity.common.value,
    )

    price_aud_cent: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[date] = mapped_column(nullable=False, default=date.today)

    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)

    description: Mapped[str | None] = mapped_column(Text)

    discontinued_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    units_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships

    sales: Mapped[list["Sale"]] = relationship(
        "Sale",
        secondary="sale_product",
        back_populates="products",
    )

    reviews: Mapped[list["Review"]] = relationship(
        "Review", 
        back_populates="product"
    )

    items: Mapped[list["Item"]] = relationship(
        "Item",
        back_populates="product",
    )

    stock: Mapped["Stock"] = relationship(
        "Stock",
        back_populates="product",
        uselist=False,
    )
