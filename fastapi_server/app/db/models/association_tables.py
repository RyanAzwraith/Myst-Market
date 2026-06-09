from __future__ import annotations
from sqlalchemy import Table, Column, Integer, ForeignKey, Index
from ..database import Base

article_product = Table(
    "article_product",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("article.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True),
    Column("product_id", Integer, ForeignKey("product.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True),
    Index("ix_article_product_product_id", "product_id"),
)

sale_product = Table(
    "sale_product",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("product.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True),
    Column("sale_id", Integer, ForeignKey("sale.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True),
    Index("ix_sale_product_sale_id", "sale_id", "product_id"),
)