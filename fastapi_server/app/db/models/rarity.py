from __future__ import annotations
from sqlalchemy import Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from ..database import Base

if TYPE_CHECKING:
    from .product import Product


class Rarity(Base):
    __tablename__ = "rarity"
    __static__ = True

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="rarity")