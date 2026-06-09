from __future__ import annotations
from datetime import datetime
from sqlalchemy import Integer, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from ..database import Base

if TYPE_CHECKING:
    from .product import Product

class Stock(Base):
    __tablename__ = "stock"

    product_id: Mapped[int] = mapped_column( ForeignKey("product.id", ondelete="CASCADE"), primary_key=True,)
    current: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())

    product: Mapped["Product"] = relationship("Product", back_populates="stock",)

