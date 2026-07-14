from app.api.api_model import APIModel
from enum import Enum
from datetime import datetime

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
