from __future__ import annotations
from sqlalchemy import Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..Base import Base

if TYPE_CHECKING:
    from .order import Order
    from .product import Product
    from .sale import Sale

class Item(Base):
    __tablename__ = "item"
    __table_args__ = (
        Index('ix_item_order_id', 'order_id', 'product_id'),
    )
    order_id: Mapped[int] = mapped_column(
        ForeignKey("order.id", ondelete="RESTRICT"),
        primary_key=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="RESTRICT"),
        primary_key=True,
    )    
    
    sale_id: Mapped[int | None] = mapped_column(
        ForeignKey("sale.id", ondelete="SET NULL"),
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    unit_price_aud_cent: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="items")
    sale: Mapped["Sale"] = relationship("Sale", back_populates="items")

  
