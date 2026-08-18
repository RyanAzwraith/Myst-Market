    
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import and_, case, func, or_

from app.db.models import Order, Sale, Stock, User, Status, Product
from app.features.admin.admin_schema import (
    AttentionAnalytics, 
    PerformanceAnalytics, 
    GraphPoint, 
    GraphAnalytics
)

def _period_metrics(session, start, end):
    valid = Status.name.notin_(("Cancelled", "Error"))
    lost = Status.name.in_(("Cancelled", "Error"))
    row = (
        session.query(
            func.coalesce(func.sum(case((valid, Order.cost_aud_cent), else_=0)), 0),
            func.count(case((valid, Order.id))),
            func.count(
                func.distinct(case((and_(valid, User.created_at >= start), User.id)))
            ),
            func.coalesce(func.sum(case((lost, Order.cost_aud_cent), else_=0)), 0),
        )
        .join(Status, Status.id == Order.status_id)
        .join(User, User.id == Order.user_id)
        .filter(Order.created_at >= start, Order.created_at < end)
        .one()
    )
    return row


def get_performance(session: Session):
    now = datetime.now()
    days = 30
    current_start = now - timedelta(days=days)
    previous_start = current_start - timedelta(days=days)
    current = _period_metrics(session, current_start, now)
    previous = _period_metrics(session, previous_start, current_start)
    return PerformanceAnalytics.from_query(days, current, previous)



def get_attention(session: Session):
    now = datetime.now()
    pending = (
        session.query(Order).join(Order.status).filter(Status.name == "Pending").count()
    )
    out_of_stock = (
        session.query(Product)
        .outerjoin(Product.stock)
        .filter(
            or_(Stock.current <= 0, Stock.product_id.is_(None)),
            Product.discontinued_at.is_(None),
        )
        .count()
    )
    ending = (
        session.query(Sale)
        .filter(
            Sale.end_at >= now,
            Sale.end_at <= now + timedelta(days=7),
        )
        .count()
    )
    return AttentionAnalytics(
        pending_orders=pending, out_of_stock_products=out_of_stock, sales_ending=ending
    )

def _month_start(date, offset):
    month = date.month - 1 + offset
    year = date.year + month // 12
    month = month % 12 + 1
    return date.replace(year=year, month=month, day=1)

def get_graph(session: Session):
    now = datetime.now()
    points = []
    for offset in range(11, -1, -1):
        start = _month_start(now, -offset)
        end = _month_start(now, -offset + 1)
        revenue, orders, _, _ = _period_metrics(session, start, end)
        points.append(
            GraphPoint(month=start.strftime("%Y-%m"), revenue=revenue, orders=orders)
        )
    return GraphAnalytics(points=points)