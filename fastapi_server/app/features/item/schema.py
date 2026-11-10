from app.core.Base import Base
from app.features.product.schema import Product, ProductSummary


class Item(Base):
    product: Product
    quantity: int
    price_cent: int
    on_sale: bool


class ItemSummary(Base):
    product_id: int
    quantity: int


class ItemResolution(Base):
    product: ProductSummary
    quantity: int
    unit_price_cent: int
    line_total_cent: int
    on_sale: bool
    warning: str | None = None