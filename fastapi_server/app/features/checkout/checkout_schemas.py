from app.api.api_model import APIModel
from datetime import datetime
from enum import Enum


class UserSummary(APIModel):
    email: str
    name: str

class ProductSummary(APIModel):
    id: int
    name: str
    slug: str

class AddressDetail(APIModel):
    country_code: str
    postcode: str
    state: str
    city: str
    street: str

class ItemSummary(APIModel):
    product_id: int
    quantity: int

class ItemResolution(APIModel):
    product_summary: ProductSummary
    quantity: int
    unit_price_cent: int
    line_total_cent: int
    on_sale: bool
    warning: str = None

class Status(int, Enum):
    Pending = 1
    Processing = 2
    Shipped = 3
    Delivered = 4
    Cancelled = 5
    Error = 6

class OrderDetail(APIModel):
    address_string: str
    item_resolutions: list[ItemResolution]
    cost_aud_cent: int
    created_at: datetime
    status: str


class OrderSummary(APIModel):
    order_id: int
    created_at: datetime
    total_cent: int
    status: Status

# Route Schemas
class ResolveItemsRequest(APIModel):
    item_summaries: list[ItemSummary]
class ResolveItemsResponse(APIModel):
    item_resolutions: list[ItemResolution]
    total_cent: int


class CheckoutUserRequest(APIModel):
    item_summaries: list[ItemSummary]
    address_detail: AddressDetail
    delivery_note: str

class CheckoutGuestRequest(APIModel):
    item_summaries: list[ItemSummary]
    address_detail: AddressDetail
    delivery_note: str
    user_summary: UserSummary

class CheckoutResponse(APIModel):
    stripe_session_url: str


class GetUserOrderResponse(APIModel):
    order_detail: OrderDetail


class GetUserOrdersResponse(APIModel):
    order_summaries: list[OrderSummary]
