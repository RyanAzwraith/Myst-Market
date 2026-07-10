from app.api_model import APIModel
from enum import Enum
from datetime import date

class SaleDetail(APIModel):
    id: int
    name: str
    slug: str
    description: str
    discount_percent: int
    start_at: date
    end_at: date
    
class ProductDetail(APIModel):
    id: int
    name: str
    category_name: str
    rarity_name: str
    price_aud_cent: int
    slug: str
    description: str
    stock: int
    sale_slug: str | None

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

class GetSalesResponse(APIModel):
    sales: list[SaleDetail]

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
