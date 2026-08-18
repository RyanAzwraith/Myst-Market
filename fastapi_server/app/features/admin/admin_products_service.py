from datetime import datetime

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException
from app.db.models import (
    Category,
    Order,
    OrderProduct,
    Product,
    Rarity,
    Review,
    Sale,
    Status,
    Stock,
)
from app.utils.apply_changes import apply_changes as _apply_changes

from app.features.shop.shop_service import (
    apply_pagination,
    apply_product_filters,
    apply_product_search,
    product_query,
)

from .admin_schema import (
    PatchProductBulkRequest,
    PatchProductRequest,
    PostProductRequest,
    PostProductSearchRequest,
    PostProductSearchResponse,
    ProductAnalytics,
    ProductSortBy,
)


def _product_metrics_query(session):
    line_total = (
        OrderProduct.quantity *
        OrderProduct.unit_price_aud_cent
    )
    valid_order = Status.name.notin_(("Cancelled", "Error"))
    cancelled_order = Status.name.in_(("Cancelled", "Error"))
    orders = (
        session.query(
            OrderProduct.product_id.label("product_id"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            valid_order,
                            OrderProduct.quantity,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("units_sold"),
            func.coalesce(
                func.sum(
                    case((valid_order, line_total), else_=0)
                ),
                0,
            ).label("revenue"),
            func.count(
                func.distinct(
                    case((valid_order, Order.id))
                )
            ).label("order_count"),
            func.count(
                func.distinct(case((cancelled_order, Order.id)))
            ).label("refunds"),
            func.coalesce(
                func.sum(
                    case((cancelled_order, line_total), else_=0)
                ),
                0,
            ).label("revenue_lost"),
        )
        .join(Order, Order.id == OrderProduct.order_id)
        .join(Status, Status.id == Order.status_id)
        .group_by(OrderProduct.product_id)
        .subquery()
    )
    reviews = (
        session.query(
            Review.product_id.label("product_id"),
            func.coalesce(func.avg(Review.rating), 0).label("average_rating"),
            func.count(Review.id).label("reviews"),
        )
        .group_by(Review.product_id)
        .subquery()
    )
    return orders, reviews

def _product_query(session):
    order_metrics, review_metrics = _product_metrics_query(session)
    query = (
        product_query(session)
        .outerjoin(
            order_metrics,
            order_metrics.c.product_id == Product.id,
        )
        .outerjoin(review_metrics, review_metrics.c.product_id == Product.id)
    )
    query = query.add_columns(
        func.coalesce(order_metrics.c.units_sold, 0).label("units_sold"),
        func.coalesce(order_metrics.c.revenue, 0).label("revenue"),
        func.coalesce(order_metrics.c.order_count, 0).label("order_count"),
        func.coalesce(order_metrics.c.refunds, 0).label("refunds"),
        func.coalesce(order_metrics.c.revenue_lost, 0).label("revenue_lost"),
        func.coalesce(review_metrics.c.average_rating, 0).label("average_rating"),
        func.coalesce(review_metrics.c.reviews, 0).label("reviews"),
    )
    return query, order_metrics, review_metrics


def get_product_analytics(session: Session, product_id: int):
    result = _product_query(session)[0].filter(Product.id == product_id).first()
    if not result:
        raise ContentNotFoundException(
            "Product Not Found",
            details={"product_id": product_id},
        )
    return ProductAnalytics.from_query(result)


def search_products(
    session: Session, 
    options: PostProductSearchRequest
):
    query, order_metrics, review_metrics = _product_query(session)
    query = apply_product_filters(
        query,
        options.categories,
        options.rarities,
        is_discontinued=options.is_discontinued or False,
        is_stock=False,
    )
    query = apply_product_search(query, options.search)
    columns = {
        ProductSortBy.price: Product.price_aud_cent,
        ProductSortBy.alphabet: Product.name,
        ProductSortBy.newest: Product.created_at,
        ProductSortBy.rarity: Rarity.order,
        ProductSortBy.quantity_sold: Product.units_sold,
        ProductSortBy.revenue: func.coalesce(order_metrics.c.revenue, 0),
        ProductSortBy.order_count: func.coalesce(order_metrics.c.order_count, 0),
        ProductSortBy.refunds: func.coalesce(order_metrics.c.refunds, 0),
        ProductSortBy.revenue_lost: func.coalesce(order_metrics.c.revenue_lost, 0),
        ProductSortBy.average_rating: func.coalesce(review_metrics.c.average_rating, 0),
        ProductSortBy.reviews: func.coalesce(review_metrics.c.reviews, 0),
        ProductSortBy.on_sale: func.coalesce(Sale.discount_percent, 0),
    }
    column = columns.get(options.sort_by, Product.created_at)
    query = query.order_by(column.asc() if options.is_ascending else column.desc())
    value, has_more = apply_pagination(query, options.limit, options.offset)
    return PostProductSearchResponse(
        products=[
            ProductAnalytics.from_query(row) for row in value
        ],
        has_more=has_more,
    )

def _category(session, name):
    entity = session.query(Category).filter(Category.name == name).first()
    if not entity:
        raise ContentNotFoundException(
            "Category Not Found",
            details={"category_name": name},
        )
    return entity


def _rarity(session, name):
    entity = session.query(Rarity).filter(Rarity.name == name).first()
    if not entity:
        raise ContentNotFoundException(
            "Rarity Not Found",
            details={"rarity_name": name},
        )
    return entity


def create_product(
    session: Session, 
    request: PostProductRequest
):
    product = Product(
        name=request.name,
        category=_category(session, request.category_name),
        rarity=_rarity(session, request.rarity_name),
        price_aud_cent=request.price_aud_cent,
        slug=request.slug,
        description=request.description,
        stock=Stock(current=request.stock),
    )
    session.add(product)
    session.commit()
    return product


def _update_product(
    product: Product,
    session: Session,
    request: PatchProductRequest,
):
    if request.category_name is not None:
        product.category = _category(session, request.category_name)
    if request.rarity_name is not None:
        product.rarity = _rarity(session, request.rarity_name)
    fields = ("name", "price_aud_cent", "slug", "description")
    if isinstance(request, PatchProductBulkRequest):
        fields = ("price_aud_cent",)
    _apply_changes(product, request, fields)
    if request.stock is not None:
        if product.stock:
            product.stock.current = request.stock
        else:
            product.stock = Stock(current=request.stock)


def patch_product(
    session: Session,
    product_id: int,
    request: PatchProductRequest,
):
    product = session.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ContentNotFoundException(
            "Product Not Found",
            details={"product_id": product_id},
        )
    _update_product(product, session, request)
    session.commit()


def patch_products(
    session: Session,
    request: PatchProductBulkRequest,
):
    products = session.query(Product).filter(Product.id.in_(request.product_ids)).all()
    if len(products) != len(set(request.product_ids)):
        raise ContentNotFoundException(
            "Product Not Found",
            details={"product_ids": request.product_ids},
        )
    for product in products:
        _update_product(product, session, request)
    session.commit()


def delete_product(
    session: Session, 
    product_id: int
):
    product = session.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ContentNotFoundException(
            "Product Not Found",
            details={"product_id": product_id},
        )
    product.discontinued_at = datetime.now()
    session.commit()
