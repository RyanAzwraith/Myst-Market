from __future__ import annotations
from datetime import datetime
from sqlalchemy import Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .product import Product


class Article(Base):
    __tablename__ = 'article'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(Text)
    desciption: Mapped[str | None] = mapped_column(Text)

    products: Mapped[list['Product']] = relationship(
        'Product',
        secondary='article_product',
        back_populates='articles',
    )
