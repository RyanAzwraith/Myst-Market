from datetime import datetime
from enum import Enum
from typing import TypeAlias

from app.api.api_model import APIModel
from app.db.models import Order, Product, Sale, User
from app.features.shop.shop_service import get_discounted_price
from app.utils.address_to_string import address_to_string

"""
Admin routes
User:
    GET    /admin/users/{user_id}/analytics
    POST   /admin/users/search

Sale:
    GET    /admin/sales/{sale_id}/analytics
    POST   /admin/sales/search
    PATCH  /admin/sales/{sale_id}
    PATCH  /admin/sales
    POST   /admin/sales
    DELETE /admin/sales/{sale_id}

Product:
    GET    /admin/products/{product_id}/analytics
    POST   /admin/products/search
    POST   /admin/products
    PATCH  /admin/products/{product_id}
    PATCH  /admin/products
    DELETE /admin/products/{product_id}l
    
Order:
    GET    /admin/orders/{order_id}/user
    POST   /admin/orders/search
    PATCH  /admin/orders/{order_id}/status
    PATCH  /admin/orders/status

Dashboard:
    GET    /admin/performance
    GET    /admin/attention
    GET    /admin/graph
"""

class OrderStatus(str, Enum):
    pending = "Pending"
    processing = "Processing"
    shipped = "Shipped"
    delivered = "Delivered"
    cancelled = "Cancelled"
    error = "Error"


class UserSortBy(str, Enum):
    alphabet = "alphabet"
    created_at = "createdAt"
    order_count = "orderCount"
    spent = "spent"
    revenue_lost = "revenueLost"
    review_count = "reviewCount"


class Registration(str, Enum):
    registered = "registered"
    guest = "guest"
    deleted = "deleted"


class SaleSortBy(str, Enum):
    start_at = "startAt"
    end_at = "endAt"
    discount_percent = "discountPercent"
    duration = "duration"
    revenue = "revenue"
    order_count = "orderCount"
    revenue_lost = "revenueLost"


class SaleActivation(str, Enum):
    active = "active"
    upcoming = "upcoming"
    expired = "expired"


class ProductSortBy(str, Enum):
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


class OrderSortBy(str, Enum):
    created_at = "createdAt"
    cost = "cost"
    status = "status"


class UserSummary(APIModel):
    id: int
    name: str
    email: str
    is_registered: bool

    @staticmethod
    def from_User(user: User):
        return UserSummary(
            id=user.id,
            name=user.name or "",
            email=user.email,
            is_registered=user.is_registered,
        )

class SaleSummary(APIModel):
    name: str
    slug: str
    discount_percent: int

class ProductSummary(APIModel):
    id: int
    name: str
    slug: str


class ItemResolution(APIModel):
    product_summary: ProductSummary
    quantity: int
    unit_price_cent: int
    line_total_cent: int
    on_sale: bool


class OrderDetail(APIModel):
    user_id: int
    address_string: str
    item_resolutions: list[ItemResolution]
    cost_aud_cent: int
    created_at: datetime
    status: OrderStatus

    @staticmethod
    def from_Order(order: Order):
        item_resolutions = [
            ItemResolution(
                product_summary=ProductSummary.model_validate(
                    order_product.product
                ),
                quantity=order_product.quantity,
                unit_price_cent=order_product.unit_price_aud_cent,
                line_total_cent=(
                    order_product.quantity
                    * order_product.unit_price_aud_cent
                ),
                on_sale=(
                    order_product.product.price_aud_cent
                    != order_product.unit_price_aud_cent
                ),
            )
            for order_product in order.order_products
        ]
        return OrderDetail(
            user_id=order.user_id,
            address_string=address_to_string(order.address),
            item_resolutions=item_resolutions,
            cost_aud_cent=order.cost_aud_cent,
            created_at=order.created_at,
            status=order.status.name,
        )
    
class OrderSummary(APIModel):
    order_id: int
    created_at: datetime
    total_cent: int
    status: OrderStatus

    @staticmethod
    def from_Order(order: Order):
        return OrderSummary(
            order_id=order.id,
            created_at=order.created_at,
            total_cent=order.cost_aud_cent,
            status=OrderStatus[order.status.name.lower()],
        )

UserAnalyticsQueryResult: TypeAlias = tuple[
    User, 
    int, # order_count
    int, # spent
    int, # revenue_lost
    int, # review_count
]

class UserAnalytics(APIModel):
    id: int
    name: str | None
    email: str
    is_registered: bool
    created_at: datetime | None
    deleted_at: datetime | None
    order_count: int
    spent: int
    revenue_lost: int
    review_count: int

    @staticmethod
    def from_query(result: UserAnalyticsQueryResult):
        user, order_count, spent, revenue_lost, review_count = result
        return UserAnalytics(
            id=user.id,
            name=user.name,
            email=user.email,
            is_registered=user.is_registered,
            created_at=user.created_at,
            deleted_at=user.deleted_at,
            order_count=order_count,
            spent=spent,
            revenue_lost=revenue_lost,
            review_count=review_count,
        )
    
SaleAnalyticsQueryResult: TypeAlias = tuple[
    Sale,
    int, # revenue
    int, # order_count
    int, # revenue_lost
]

class SaleAnalytics(APIModel):
    id: int
    name: str
    slug: str
    description: str | None
    start_at: datetime
    end_at: datetime
    discount_percent: int
    revenue: int
    order_count: int
    revenue_lost: int

    @staticmethod
    def from_query(result: SaleAnalyticsQueryResult):
        sale, revenue, order_count, revenue_lost = result
        return SaleAnalytics(
            id=sale.id,
            name=sale.name,
            slug=sale.slug,
            description=sale.description,
            start_at=sale.start_at,
            end_at=sale.end_at,
            discount_percent=sale.discount_percent,
            revenue=revenue or 0,
            order_count=order_count or 0,
            revenue_lost=revenue_lost or 0,
        )
    
ProductAnalyticsQueryResult: TypeAlias = tuple[
    Product,  # Product
    Sale | None,  # Sale
    int | None,  # units_sold
    int | None,  # revenue
    int | None,  # order_count
    int | None,  # refunds
    int | None,  # revenue_lost
    float | None,  # average_rating
    int | None,  # reviews
]

class ProductAnalytics(APIModel):
    id: int
    name: str
    category_name: str
    rarity_name: str
    price_aud_cent: int
    slug: str
    description: str
    stock: int
    discounted_price: int | None
    sale: SaleSummary | None
    discontinued_at: datetime | None
    created_at: datetime
    units_sold: int
    revenue: int
    order_count: int
    refunds: int
    revenue_lost: int
    average_rating: float
    reviews: int

    @staticmethod
    def from_query(result: ProductAnalyticsQueryResult):
        product, sale, units_sold, revenue, order_count, refunds, revenue_lost, average_rating, reviews = result
        return ProductAnalytics(
            id=product.id,
            name=product.name,
            category_name=product.category.name,
            rarity_name=product.rarity.name,
            price_aud_cent=product.price_aud_cent,
            slug=product.slug,
            description=product.description or "",
            stock=product.stock.current if product.stock else 0,
            discounted_price=get_discounted_price(product, sale),
            sale=SaleSummary.model_validate(sale) if sale else None,
            discontinued_at=product.discontinued_at,
            created_at=product.created_at,
            units_sold=units_sold or 0,
            revenue=revenue or 0,
            order_count=order_count or 0,
            refunds=refunds or 0,
            revenue_lost=revenue_lost or 0,
            average_rating=average_rating or 0.0,
            reviews=reviews or 0,
        )

PerformanceQueryResult: TypeAlias = tuple[
    int,  # revenue
    int,  # orders
    int,  # new_customers
    int,  # revenue_lost
]

class PerformanceAnalytics(APIModel):
    period_days: int
    revenue: int
    orders: int
    new_customers: int
    revenue_lost: int
    previous_revenue: int
    previous_orders: int
    previous_new_customers: int
    previous_revenue_lost: int

    @staticmethod
    def from_query(
        period_days: int, 
        current: PerformanceQueryResult, 
        previous_result: PerformanceQueryResult
    ):
        current_revenue, current_orders, current_new_customers, current_revenue_lost = current
        previous_revenue, previous_orders, previous_new_customers, previous_revenue_lost = previous_result
        return PerformanceAnalytics(
            period_days=period_days,
            revenue=current_revenue,
            orders=current_orders,
            new_customers=current_new_customers,
            revenue_lost=current_revenue_lost,
            previous_revenue=previous_revenue,
            previous_orders=previous_orders,
            previous_new_customers=previous_new_customers,
            previous_revenue_lost=previous_revenue_lost,
        )


class AttentionAnalytics(APIModel):
    pending_orders: int
    out_of_stock_products: int
    sales_ending: int


class GraphPoint(APIModel):
    month: str
    revenue: int
    orders: int


class GraphAnalytics(APIModel):
    points: list[GraphPoint]


class GetUserAnalyticsResponse(APIModel):
    user: UserAnalytics


class GetSaleAnalyticsResponse(APIModel):
    sale: SaleAnalytics


class GetProductAnalyticsResponse(APIModel):
    product: ProductAnalytics


class GetOrderUserResponse(APIModel):
    order: OrderDetail
    user: UserSummary


class PostUserSearchRequest(APIModel):
    limit: int | None = None
    offset: int | None = None
    is_ascending: bool | None = None
    sort_by: UserSortBy | None = None
    search: str | None = None
    registration: list[Registration] | None = None


class PostUserSearchResponse(APIModel):
    users: list[UserAnalytics]
    has_more: bool


class PostSaleSearchRequest(APIModel):
    limit: int | None = None
    offset: int | None = None
    activation: list[SaleActivation] | None = None
    is_ascending: bool | None = None
    sort_by: SaleSortBy | None = None
    search: str | None = None


class PostSaleSearchResponse(APIModel):
    sales: list[SaleAnalytics]
    has_more: bool


class PatchSaleRequest(APIModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    discount_percent: int | None = None


class PatchSaleBulkRequest(APIModel):
    sale_ids: list[int]
    start_at: datetime | None = None
    end_at: datetime | None = None
    discount_percent: int | None = None


class PostSaleRequest(APIModel):
    name: str
    slug: str
    description: str
    discount_percent: int
    start_at: datetime
    end_at: datetime


class PostProductSearchRequest(APIModel):
    limit: int | None = None
    offset: int | None = None
    categories: list[str] | None = None
    rarities: list[str] | None = None
    is_ascending: bool | None = None
    sort_by: ProductSortBy | None = None
    search: str | None = None
    is_discontinued: bool | None = None


class PostProductSearchResponse(APIModel):
    products: list[ProductAnalytics]
    has_more: bool


class PatchProductRequest(APIModel):
    name: str | None = None
    category_name: str | None = None
    rarity_name: str | None = None
    price_aud_cent: int | None = None
    slug: str | None = None
    description: str | None = None
    stock: int | None = None


class PatchProductBulkRequest(APIModel):
    product_ids: list[int]
    category_name: str | None = None
    rarity_name: str | None = None
    price_aud_cent: int | None = None
    stock: int | None = None


class PostProductRequest(APIModel):
    name: str
    category_name: str
    rarity_name: str
    price_aud_cent: int
    slug: str
    description: str
    stock: int


class PostOrdersSearchRequest(APIModel):
    limit: int | None = None
    offset: int | None = None
    search_name: str | None = None
    status: list[OrderStatus] | None = None
    sort_by: OrderSortBy | None = None
    is_ascending: bool | None = None


class PostOrdersSearchResponse(APIModel):
    orders: list[OrderSummary]
    has_more: bool


class PatchOrderStatusRequest(APIModel):
    status: OrderStatus | None = None


class PatchOrderBulkRequest(APIModel):
    order_ids: list[int]
    status: OrderStatus
