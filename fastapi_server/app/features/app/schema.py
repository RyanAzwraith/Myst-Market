from app.core.Base import Base


class Stats(Base):
    product_count: int
    customer_count: int
    total_average_rating: float


class Performance(Base):
    period_days: int
    revenue: int
    orders: int
    new_customers: int
    revenue_lost: int
    previous_revenue: int
    previous_orders: int
    previous_new_customers: int
    previous_revenue_lost: int


class Attention(Base):
    pending_orders: int
    out_of_stock_products: int
    sales_ending: int


class GraphPoint(Base):
    month: str
    revenue: int
    orders: int


class Graph(Base):
    points: list[GraphPoint]