from app.api.api_model import APIModel
from enum import Enum
from datetime import datetime
from typing import TypeAlias

from app.db.models import (
    Product,
    Sale,
)


class SaleSummary(APIModel):
    name: str
    slug: str
    discount_percent: int

class SaleDetail(APIModel):
    id: int
    name: str
    slug: str
    description: str
    discount_percent: int
    start_at: datetime
    end_at: datetime

ProductQuery: TypeAlias = tuple[
    Product, 
    Sale | None
]

class ProductDetail(APIModel):
    id: int
    name: str
    category_name: str
    rarity_name: str
    price_aud_cent: int
    slug: str
    description: str
    stock:int
    discounted_price: int | None
    sale: SaleSummary | None

    @staticmethod
    def from_ProductQuery(query: ProductQuery):    
        product, sale = query

        discounted_price = (
            round(
                (100 - sale.discount_percent)
                / 100 * product.price_aud_cent 
            ) 
            if sale else product.price_aud_cent
        )
        
        return ProductDetail(
            id=product.id,
            name=product.name,
            category_name=product.category.name,
            rarity_name=product.rarity.name,
            price_aud_cent=product.price_aud_cent,
            slug=product.slug,
            description=product.description,
            stock= product.stock.current if product.stock else 0,
            discounted_price=discounted_price,
            sale=SaleSummary(
                name = sale.name,
                slug = sale.slug,
                discount_percent = sale.discount_percent
            ) if sale else None,
        )

class ProductsSearch(APIModel):
    products: list[ProductDetail]
    has_more: bool

class SortBy(str, Enum):
    popularity = "popularity"
    price = "price"
    alphabet = "alphabet"
    newest = "newest"
    rarity = "rarity"

# Route Schemas
class GetCategoriesResponse(APIModel):
    categories: list[str]

class GetRaritiesResponse(APIModel):
    rarities: list[str]

class GetSaleBySlugResponse(APIModel):
    sale: SaleDetail

class GetProductBySlugResponse(APIModel):
    product: ProductDetail

class PostProductsSearchRequest(APIModel):
    limit: int | None  = None
    offset: int | None  = None
    categories: list[str] | None  = None
    rarities: list[str] | None  = None
    is_ascending: bool | None  = None
    sort_by: SortBy | None  = None
    search: str | None  = None

class PostProductsSearchResponse(APIModel):
    products: list[ProductDetail]
    has_more: bool 
