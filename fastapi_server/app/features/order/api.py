import stripe
from fastapi import APIRouter, Depends, Request

from app.api.dependencies import (
    get_admin_user,
    get_current_user,
    get_optional_user,
    get_db,
)
from app.api.paths import Paths
from app.core.Base import Base
from app.core.config import get_config
from app.core.exceptions import AuthorizationException, RequestException
from app.features.item.schema import ItemSummary
from app.features.user.schema import UserInput
from app.features.user.service import send_set_password_email
from app.features.user.schema import User

from .schema import (
    Address,
    Order,
    OrderSummary,
    Status,
    AdminSearchParams
)
from .service import create_stripe_session
from .service import handle_failed_payment, handle_successful_payment

order_router = APIRouter()


# Get Order By ID
class GetOrderByIdResponse(Base):
    order: Order
    user: User

@order_router.get(
    Paths.Order.byId("{id}"),
    status_code=200,
    response_model=GetOrderByIdResponse,
    dependencies=[Depends(get_current_user)],
)
async def get_order_by_id_handler(
    id: int,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    order = db.order.get(id)
    if order.user_id != user.id:
        raise AuthorizationException("Order does not belong to user")

    order_user = db.user.get(order.user_id)
    return GetOrderByIdResponse(
        order=order, 
        user=User.model_validate(order_user)
    )


# Create Order
class CreateOrderResponse(Base):
    stripe_session_url: str

class CreateOrderRequest(Base):
    items: list[ItemSummary]
    address: Address
    delivery_note: str
    user: UserInput | None
    is_creating_account: bool | None

@order_router.post(
    Paths.Order.create,
    status_code=201,
    response_model=CreateOrderResponse,
)
async def create_order_handler(
    req: CreateOrderRequest,
    user=Depends(get_optional_user),
    db=Depends(get_db),
):
    items, total_cent = db.item.resolve(req.items)

    if user is None:
        if req.user is None:
            raise RequestException("User details are required")

        user = db.user.create(
            email=req.user.email,
            name=req.user.name,
            is_registered=bool(req.is_creating_account),
        )

    order = db.order.create_with_items(
        user_id=user.id,
        address=req.address,
        items=items,
        status=Status.pending.value,
        cost_aud_cent=total_cent,
        delivery_note=req.delivery_note,
    )

    if req.is_creating_account:
        send_set_password_email(user)

    stripe_session_url = create_stripe_session(order, items)
    return {"stripe_session_url": stripe_session_url}


# Patch Order Status
class PatchOrderStatusRequest(Base):
    status: Status

@order_router.patch(
    Paths.Order.status("{id}"),
    status_code=204,
    dependencies=[Depends(get_admin_user)],
)
async def patch_order_status_handler(
    id: int,
    req: PatchOrderStatusRequest,
    db=Depends(get_db),
):
    db.order.patch_status(id, req.status.value)


orders_router = APIRouter()


# Get Recent Orders
class GetRecentOrdersResponse(Base):
    orders: list[Order]

@orders_router.get(
    Paths.Orders.recent,
    status_code=200,
    response_model=GetRecentOrdersResponse,
    dependencies=[Depends(get_admin_user)],
)
async def get_recent_orders_handler(
    db=Depends(get_db),
):
    return {"orders": db.order.get_recent()}


# Admin Search Orders
class AdminSearchOrdersResponse(Base):
    orders: list[OrderSummary]
    has_more: bool

class AdminSearchOrdersRequest(Base):
    search_params: AdminSearchParams | None = None
    limit: int | None = None
    offset: int

@orders_router.post(
    Paths.Orders.searchAdmin,
    status_code=200,
    response_model=AdminSearchOrdersResponse,
    dependencies=[Depends(get_admin_user)],
)
async def admin_search_orders_handler(
    req: AdminSearchOrdersRequest,
    db=Depends(get_db),
):
    search_params = req.search_params
    orders, has_more = db.order.search_admin(
        search_name=(
            search_params.search_name
            if search_params
            else None
        ),
        statuses=(
            [status.value for status in search_params.status]
            if search_params and search_params.status
            else None
        ),
        sort_by=(
            search_params.sort.value
            if search_params and search_params.sort
            else None
        ),
        is_ascending=(
            search_params.is_ascending
            if search_params
            else None
        ),
        limit=req.limit,
        offset=req.offset,
    )
    return {"orders": orders, "has_more": has_more}


# Patch Orders Status
class PatchOrdersStatusRequest(Base):
    order_ids: list[int]
    status: Status

@orders_router.patch(
    Paths.Orders.status,
    status_code=204,
    dependencies=[Depends(get_admin_user)],
)
async def patch_orders_status_handler(
    req: PatchOrdersStatusRequest,
    db=Depends(get_db),
):
    db.order.patch_statuses(
        req.order_ids,
        req.status.value,
    )

stripe_router = APIRouter()

# Post Stripe Payment
class StripeWebhookResponse(Base):
    received: bool


@stripe_router.post(
    "/stripe/payment",
    status_code=200,
    response_model=StripeWebhookResponse,
)
async def stripe_webhook(
    req: Request,
    db=Depends(get_db),
):
    payload = await req.body()
    signature = req.headers.get("stripe-signature")
    if not signature:
        raise RequestException("Missing Stripe signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=get_config().stripe_payment_hook_key,
        )
    except stripe.error.SignatureVerificationError as exc:
        raise RequestException("Invalid Stripe signature") from exc
    except ValueError as exc:
        raise RequestException("Invalid Stripe payload") from exc

    event_type = event["type"]
    stripe_session = event["data"]["object"]

    if event_type == "checkout.session.async_payment_succeeded":
        handle_successful_payment(db, stripe_session)
    elif (
        event_type == "checkout.session.completed"
        and stripe_session.get("payment_status") == "paid"
    ):
        handle_successful_payment(db, stripe_session)
    elif event_type == "checkout.session.async_payment_failed":
        handle_failed_payment(db, stripe_session)

    return StripeWebhookResponse(received=True)