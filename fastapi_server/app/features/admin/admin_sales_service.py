from datetime import datetime

from sqlalchemy import and_, case, func, or_
from sqlalchemy.orm import Session

from app.utils.apply_changes import apply_changes
from app.core.exceptions import ContentNotFoundException
from app.db.models import Order, OrderProduct, Sale, Status, sale_product
from app.features.shop.shop_service import apply_pagination

from .admin_schema import (
    PatchSaleBulkRequest,
    PatchSaleRequest,
    PostSaleRequest,
    PostSaleSearchRequest,
    PostSaleSearchResponse,
    SaleAnalytics,
    SaleActivation,
    SaleSortBy,
)


def _sale_analytics_query(session):
    value = OrderProduct.quantity * OrderProduct.unit_price_aud_cent

    return (
        session.query(
            Sale,
            func.coalesce(
                func.sum(
                    case(
                        (Status.name.notin_(("Cancelled", "Error")), value),
                        else_=0,
                    )
                ),
                0,
            ).label("revenue"),
            func.count(func.distinct(Order.id)).label("order_count"),
            func.coalesce(
                func.sum(
                    case(
                        (Status.name.in_(("Cancelled", "Error")), value),
                        else_=0,
                    )
                ),
                0,
            ).label("revenue_lost"),
        )
        .outerjoin(sale_product, sale_product.c.sale_id == Sale.id)
        .outerjoin(
            OrderProduct,
            OrderProduct.product_id == sale_product.c.product_id,
        )
        .outerjoin(
            Order,
            and_(
                Order.id == OrderProduct.order_id,
                Order.created_at >= Sale.start_at,
                Order.created_at < Sale.end_at,
            ),
        )
        .outerjoin(Status, Status.id == Order.status_id)
        .group_by(Sale.id)
    )


def get_sale_analytics(session: Session, sale_id: int):
    result = (
        _sale_analytics_query(session)
        .filter(
            Sale.id == sale_id,
        )
        .first()
    )

    if not result:
        raise ContentNotFoundException(
            "Sale Not Found",
            details={"sale_id": sale_id},
        )

    return SaleAnalytics.from_query(result)


def search_sales(session: Session, options: PostSaleSearchRequest):
    query = _sale_analytics_query(session)

    if options.search:
        term = f"%{options.search}%"
        query = query.filter(Sale.name.ilike(term))

    now = datetime.now()
    if options.activation:
        filters = []
        for activation in options.activation:
            if activation == SaleActivation.active:
                filters.append(and_(Sale.start_at <= now, Sale.end_at >= now))
            elif activation == SaleActivation.upcoming:
                filters.append(Sale.start_at > now)
            else:
                filters.append(Sale.end_at < now)
        query = query.filter(or_(*filters))

    columns = {
        SaleSortBy.end_at: Sale.end_at,
        SaleSortBy.discount_percent: Sale.discount_percent,
        SaleSortBy.revenue: query.column_descriptions[1]["expr"],
        SaleSortBy.order_count: query.column_descriptions[2]["expr"],
        SaleSortBy.revenue_lost: query.column_descriptions[3]["expr"],
    }
    column = columns.get(options.sort_by, Sale.start_at)

    query = query.order_by(column.asc() if options.is_ascending else column.desc())

    values, has_more = apply_pagination(query, options.limit, options.offset)

    return PostSaleSearchResponse(
        sales=[SaleAnalytics.from_query(row) for row in values],
        has_more=has_more,
    )


def patch_sale(session, sale_id, request: PatchSaleRequest):
    sale = session.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise ContentNotFoundException(
            "Sale Not Found",
            details={"sale_id": sale_id},
        )

    apply_changes(
        sale,
        request,
        (
            "start_at",
            "end_at",
            "discount_percent",
            "description",
            "name",
            "slug",
        ),
    )

    session.commit()


def patch_sales(session, request: PatchSaleBulkRequest):
    sales = session.query(Sale).filter(Sale.id.in_(request.sale_ids)).all()

    if len(sales) != len(set(request.sale_ids)):
        raise ContentNotFoundException(
            "Sale Not Found",
            details={"sale_ids": request.sale_ids},
        )

    for sale in sales:
        apply_changes(
            sale,
            request,
            ("discount_percent", "start_at", "end_at"),
        )

    session.commit()


def create_sale(session, request: PostSaleRequest):
    sale = Sale(**request.model_dump())
    session.add(sale)
    session.commit()
    return sale


def delete_sale(session, sale_id):
    sale = session.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise ContentNotFoundException(
            "Sale Not Found",
            details={"sale_id": sale_id},
        )
    session.delete(sale)
    session.commit()
