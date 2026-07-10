from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .category import Category
    from .rarity import Rarity
    from .article import Article
    from .sale import Sale
    from .review import Review
    from .order_product import OrderProduct
    from .stock import Stock


class Product(Base):
    __tablename__ = "product"

    __table_args__ = (
        Index("ix_product_category_id", "category_id"),
        Index("ix_product_rarity_id", "rarity_id"),
        Index("ix_product_category_rarity", "category_id", "rarity_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(Text, nullable=False)

    category_id: Mapped[int] = mapped_column(
        ForeignKey("category.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )

    rarity_id: Mapped[int] = mapped_column(
        ForeignKey("rarity.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
    )

    price_aud_cent: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(nullable=False, default=func.now())

    slug: Mapped[str] = mapped_column(Text, nullable=False)

    description: Mapped[str | None] = mapped_column(Text)

    discontinued_at: Mapped[datetime | None] = mapped_column()
    
    units_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    rarity: Mapped["Rarity"] = relationship("Rarity", back_populates="products")

    articles: Mapped[list["Article"]] = relationship(
        "Article",
        secondary="article_product",
        back_populates="products",
    )

    sales: Mapped[list["Sale"]] = relationship(
        "Sale",
        secondary="sale_product",
        back_populates="products",
    )

    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product")

    order_products: Mapped[list["OrderProduct"]] = relationship("OrderProduct", back_populates="product")

    stock: Mapped["Stock"] = relationship(
        "Stock",
        back_populates="product",
        uselist=False,
    )