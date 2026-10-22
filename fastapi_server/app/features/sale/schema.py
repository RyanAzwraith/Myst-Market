from datetime import date
from enum import Enum

from app.core.Base import Base


class SaleSummary(Base):
    name: str
    slug: str
    discount_perc: int


class Sale(SaleSummary):
    id: int
    description: str
    start_at: date
    end_at: date


class SaleInput(Base):
    name: str
    slug: str
    discount_perc: int
    description: str
    start_at: date
    end_at: date


class SaleAnalytics(Sale):
    revenue: int
    order_count: int
    revenue_lost: int


class AdminSort(str, Enum):
    start_at = "startAt"
    end_at = "endAt"
    discount_perc = "discountPerc"
    duration = "duration"
    revenue = "revenue"
    order_count = "orderCount"
    revenue_lost = "revenueLost"

class Activation(str, Enum):
    active = "active"
    upcoming = "upcoming"
    expired = "expired"


class AdminSearchParams(Base):
    activation: list[Activation]
    is_ascending: bool
    sort: AdminSort
    search: str