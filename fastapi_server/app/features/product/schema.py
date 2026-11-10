from datetime import date
from enum import Enum

from app.core.Base import Base
from app.features.sale.schema import SaleSummary


# Enums
class Category(str, Enum):
    weapons = "weapons"
    armaments = "armaments"
    apparel = "apparel"
    accessories = "accessories"
    potions = "potions"
    artifacts = "artifacts"


class Rarity(str, Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    epic = "epic"
    legendary = "legendary"


rarities_order = {
    Rarity.common: 1,
    Rarity.uncommon: 2,
    Rarity.rare: 3,
    Rarity.epic: 4,
    Rarity.legendary: 5,
}


class Sort(str, Enum):
    popularity = "popularity"
    price = "price"
    alphabet = "alphabet"
    newest = "newest"
    rarity = "rarity"


class AdminSort(str, Enum):
    price = "price"
    alphabet = "alphabet"
    newest = "newest"
    rarity = "rarity"
    quantity_sold = "quantitySold"
    revenue = "revenue"
    order_count = "orderCount"
    refunds = "refunds"
    revenue_lost = "revenueLost"
    average_rating = "averageRating"
    reviews = "reviews"
    on_sale = "onSale"


# Schemas
class ProductFields(Base):
    name: str
    category_name: str
    rarity_name: str
    price_aud_cent: int
    slug: str
    description: str
    stock: int


class Product(ProductFields):
    id: int
    discounted_price: int | None
    sale: SaleSummary | None


class ProductSummary(Base):
    id: int
    sale_id: int | None
    name: str
    slug: str


class ProductAnalytics(Product):
    discontinued_at: date | None
    created_at: date 
    units_sold: int
    revenue: int
    order_count: int
    refunds: int
    revenue_lost: int
    average_rating: float
    reviews: int



class SearchParams(Base):
    categories: list[Category] | None = None
    rarities: list[Rarity] | None = None
    sort: Sort | None = None
    is_ascending: bool | None = None
    search: str | None = None


class AdminSearchParams(Base):
    sort: AdminSort | None = None
    categories: list[Category] | None = None
    rarities: list[Rarity] | None = None
    search: str | None = None
    is_discontinued: bool | None = None
    is_ascending: bool | None = None


