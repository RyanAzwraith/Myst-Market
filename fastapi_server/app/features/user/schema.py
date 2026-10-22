from datetime import date
from enum import Enum

from app.core.Base import Base


# Enums
class AdminSort(str, Enum):
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


# Schemas
class UserSummary(Base):
    email: str
    name: str

class User(UserSummary):
    id: int
    is_admin: bool
    is_registered: bool

class UserInput(UserSummary):
    pass

class UserPatch(Base):
    email: str | None = None
    name: str | None = None

class UserAnalytics(UserSummary):
    id: int
    is_registered: bool
    created_at: date
    deleted_at: date | None
    order_count: int
    spent: int
    revenue_lost: int
    review_count: int

class AdminSearchParams(Base):
    is_ascending: bool
    sort_by: AdminSort
    search: str
    registration: list[Registration]
