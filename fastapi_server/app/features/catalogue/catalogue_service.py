from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.db.models import (
    Product,
    User,
    Review,
    Sale,
)
from app.features.shop.shop_schemas import (
    ProductDetail,
    SaleDetail,
    SortBy
)
from app.features.shop.shop_service import (
    product_query,
    apply_product_filters,
    apply_product_sorting,
)
from app.features.review.review_schemas import (
    ReviewDetail,
)

from .catalogue_schemas import (
    StatsDetail,
)


def get_stats(
    session: Session,
) -> StatsDetail:
    
    product_count = (
        session.query(Product)
        .count()
    )

    customer_count = (
        session.query(User)
        .filter(User.orders.any())
        .count()
    )

    total_average_rating = round(
        session.query(
            func.coalesce(func.avg(Review.rating), 0)
        )
        .scalar(),
        1
    )

    return StatsDetail(
        product_count = product_count,
        customer_count = customer_count,
        total_average_rating = total_average_rating,
    )


def get_featured_product(
    session: Session,
) -> ProductDetail:
    review_query = (
        session.query(
            Review.product_id,
            func.avg(Review.rating).label("average_rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.product_id)
        .subquery()
    )

    query = product_query(session)
    query = apply_product_filters(query)
    query = query.outerjoin(
        review_query,
        review_query.c.product_id == Product.id,
    )
    query = (
        query
        .filter(
            Sale.id.isnot(None),
            review_query.c.review_count > 3,
        )
        .order_by(
            review_query.c.average_rating.desc(),
            review_query.c.review_count.desc(),
        )
    )

    product = query.first()
    if not product:
        return get_newest_products(session, limit=1)[0]

    return ProductDetail.from_ProductQuery(product)


def get_popular_products(
    session: Session,
    limit: int,
) -> list[ProductDetail]:
    query = product_query(session)
    query = apply_product_filters(query)
    query = apply_product_sorting(
        query, sort_by=SortBy.popularity
    )
    query = query.limit(limit)

    return map(ProductDetail.from_ProductQuery, query.all())


def get_newest_products(
    session: Session,
    limit: int,
) -> list[ProductDetail]:
    query = product_query(session)
    query = apply_product_filters(query)
    query = apply_product_sorting(
        query, sort_by=SortBy.newest, is_ascending=True
    )
    query = query.limit(limit)

    return list(map(ProductDetail.from_ProductQuery, query.all()))

def get_testimonials(
    session: Session,
    limit: int,
) -> list[ReviewDetail]:
    query = (
        session.query(Review)
        .filter(
            func.length(Review.description) > 20,
            Review.rating == 5
        )
        .order_by(Review.created_at.desc())
        .limit(limit)
    )

    return map(ReviewDetail.from_Review, query.all())


def get_biggest_sales(
    session: Session,
    limit: int,
) -> list[SaleDetail]:
    now = datetime.now()
    
    query = (
        session.query(Sale)
        .filter(
            Sale.start_at <= now,
            Sale.end_at >= now,
        )
        .order_by(Sale.discount_percent.desc())
        .limit(limit)
    )

    return list(map(SaleDetail.model_validate, query.all()))
