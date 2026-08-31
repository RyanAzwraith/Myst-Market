from __future__ import annotations
from datetime import date
from sqlalchemy import Text, Integer, ForeignKey, text, func, Index, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .product import Product
    from .user import User

class Review(Base):
    __tablename__ = "review"

    __table_args__ = (
        Index('ix_review_product_id', 'product_id'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL")
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="CASCADE"),
    )

    created_at: Mapped[date] = mapped_column(
        Date, nullable=False, default=date.today()
    )

    rating: Mapped[int | None] = mapped_column(Integer, default=text("0"))

    description: Mapped[str | None] = mapped_column(Text)

    product: Mapped["Product"] = relationship("Product", back_populates="reviews")
    user: Mapped["User"] = relationship("User", back_populates="reviews")