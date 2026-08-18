from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ContentNotFoundException
from app.db.models import Order, Status, User

from app.features.shop.shop_service import apply_pagination

from .admin_schema import (
    GetOrderUserResponse,
    OrderSortBy,
    OrderSummary,
    OrderDetail,
    PatchOrderBulkRequest,
    PatchOrderStatusRequest,
    PostOrdersSearchRequest,
    PostOrdersSearchResponse,
    UserSummary,
)

def _status(session, status):
    name = status.name.capitalize()
    entity = session.query(Status).filter(Status.name == name).first()
    if not entity:
        raise ContentNotFoundException(
            "Order Status Not Found",
            details={"status": name},
        )
    return entity

def get_order_user(session: Session, order_id: int):
    order = (
        session.query(Order)
        .options(joinedload(Order.user))
        .options(joinedload(Order.status))
        .options(joinedload(Order.address))
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise ContentNotFoundException(
            "Order Not Found",
            details={"order_id": order_id},
        )
    
    return GetOrderUserResponse(
        order=OrderDetail.from_Order(order),
        user=UserSummary.from_User(order.user),
    )


def search_orders(session: Session, options: PostOrdersSearchRequest):
    query = session.query(Order).join(Order.status)
    
    if options.search_name:
        query = query.join(User).filter(
            User.name.ilike(f"%{options.search_name}%")
        )  
    
    if options.status:
        query = query.filter(
            Status.name.in_(options.status)
        )

    column = Order.created_at
    if options.sort_by == OrderSortBy.cost:
        column = Order.cost_aud_cent
    elif options.sort_by == OrderSortBy.status:
        column = Status.name

    query = query.order_by(column.asc() if options.is_ascending else column.desc())

    values, has_more = apply_pagination(query, options.limit, options.offset)

    return PostOrdersSearchResponse(
        orders=[ OrderSummary.from_Order(order)
            for order in values
        ],
        has_more=has_more,
    )

def patch_order_status(session, order_id, request: PatchOrderStatusRequest):
    order = session.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ContentNotFoundException(
            "Order Not Found",
            details={"order_id": order_id},
        )
    if request.status is not None:
        order.status = _status(session, request.status)

    session.commit()


def patch_orders_status(session, request: PatchOrderBulkRequest):
    orders = session.query(Order).filter(Order.id.in_(request.order_ids)).all()
    if len(orders) != len(set(request.order_ids)):
        raise ContentNotFoundException(
            "Order Not Found",
            details={"order_ids": request.order_ids},
        )
    status = _status(session, request.status)
    for order in orders:
        order.status = status
    session.commit()



