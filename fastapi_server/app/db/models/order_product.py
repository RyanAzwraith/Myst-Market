from __future__ import annotations
from sqlalchemy import Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .order import Order
    from .product import Product

class OrderProduct(Base):
    __tablename__ = "order_product"
    __table_args__ = (
        Index('ix_order_product_order_id', 'order_id', 'product_id'),
    )
    order_id: Mapped[int] = mapped_column(
        ForeignKey("order.id", ondelete="RESTRICT"),
        primary_key=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="SET NULL"),
        primary_key=True,
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    unit_price_aud_cent: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="order_products")
    product: Mapped["Product"] = relationship("Product", back_populates="order_products")