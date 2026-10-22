from datetime import date
from enum import Enum

from app.core.Base import Base
from app.features.item.schema import ItemResolution


# Enums
class Status(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    error = "error"


class AdminSort(str, Enum):
    created_at = "createdAt"
    cost = "cost"
    status = "status"


# Schemas
class Address(Base):
    country_code: str
    postcode: str
    state: str
    city: str
    street: str

class Order(Base):
    id: int
    user_id: int
    address_string: str
    items: list[ItemResolution]
    cost_aud_cent: int
    created_at: date
    status: Status


class OrderSummary(Base):
    id: int
    created_at: date
    total_cent: int
    status: Status


class AdminSearchParams(Base):
    search_name: str | None = None
    status: list[Status] | None = None
    sort: AdminSort | None = None
    is_ascending: bool | None = None
