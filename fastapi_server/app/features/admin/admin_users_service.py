from sqlalchemy import and_, case, func, or_
from sqlalchemy.orm import Session, Query 

from app.core.exceptions import ContentNotFoundException
from app.db.models import Order, Review, Status, User
from app.features.shop.shop_service import apply_pagination

from .admin_schema import (
    PostUserSearchRequest,
    PostUserSearchResponse,
    Registration,
    UserAnalyticsQueryResult,
    UserAnalytics,
    UserSortBy,
)


def _user_analytics_query(session) -> Query[UserAnalyticsQueryResult]:
    orders = (
        session.query(
            Order.user_id.label("user_id"),
            func.coalesce(func.count(Order.id), 0).label("order_count"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Status.name.notin_(("Cancelled", "Error")),
                            Order.cost_aud_cent,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label("spent"),
            func.coalesce(
                func.sum(
                    case(
                        (Status.name.in_(("Cancelled", "Error")), Order.cost_aud_cent),
                        else_=0,
                    )
                ),
                0,
            ).label("revenue_lost"),
        )
        .join(Order.status)
        .group_by(Order.user_id)
        .subquery()
    )
    reviews = (
        session.query(
            Review.user_id.label("user_id"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.user_id)
        .subquery()
    )
    return (
        session.query(
            User,
            func.coalesce(orders.c.order_count, 0).label("order_count"),
            func.coalesce(orders.c.spent, 0).label("spent"),
            func.coalesce(orders.c.revenue_lost, 0).label("revenue_lost"),
            func.coalesce(reviews.c.review_count, 0).label("review_count"),
        )
        .outerjoin(orders, orders.c.user_id == User.id)
        .outerjoin(
            reviews,
            reviews.c.user_id == User.id,
        )
    )


def get_user_analytics(session: Session, user_id: int):
    result = _user_analytics_query(session).filter(User.id == user_id).first()
    if not result:
        raise ContentNotFoundException(
            "User Not Found",
            details={"user_id": user_id},
        )
    return UserAnalytics.from_query(result)


def search_users(session: Session, options: PostUserSearchRequest):
    query = _user_analytics_query(session)

    if options.search:
        term = f"%{options.search}%"
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term)))

    filters = {
        Registration.registered: and_(
            User.is_registered.is_(True),
            User.deleted_at.is_(None),
        ),
        Registration.guest: and_(
            User.is_registered.is_(False),
            User.deleted_at.is_(None),
        ),
        Registration.deleted: User.deleted_at.isnot(None),
    }

    if options.registration:
        query = query.filter(or_(*(filters[r] for r in options.registration)))

    sort_expressions = {
        UserSortBy.alphabet: User.name,
        UserSortBy.order_count: query.column_descriptions[1]["expr"],
        UserSortBy.spent: query.column_descriptions[2]["expr"],
        UserSortBy.revenue_lost: query.column_descriptions[3]["expr"],
        UserSortBy.review_count: query.column_descriptions[4]["expr"],
    }
    sort_expression = sort_expressions.get(options.sort_by, User.created_at)

    if options.is_ascending:
        query = query.order_by(sort_expression.asc())
    else:
        query = query.order_by(sort_expression.desc())

    values, has_more = apply_pagination(query, options.limit, options.offset)

    return PostUserSearchResponse(
        users=[UserAnalytics.from_query(row) for row in values],
        has_more=has_more,
    )
