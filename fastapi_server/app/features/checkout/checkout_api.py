from fastapi import APIRouter, Depends, Request
import stripe

from app.core import get_config
from app.core.exceptions import (
    RequestException
)
from app.api.dependencies import (
    get_session,
    get_current_user,
)

from .checkout_schemas import (
    ResolveItemsRequest,
    ResolveItemsResponse,
    CheckoutUserRequest,
    CheckoutGuestRequest,
    CheckoutResponse,
    GetUserOrderResponse,
    GetUserOrdersResponse,
)

from .checkout_service import (
    get_item_resolutions,
    calc_checkout_cart_total,
    create_guest_user,
    create_order,
    create_stripe_session,
    get_order_detail,
    get_order_summaries_with_user_id,
    handle_successful_payment,
    handle_failed_payment,
)

router = APIRouter()
# POST /cart-resolution
# POST /checkout/guest
# POST /checkout/user
# GET /user/order/order_id
# GET /user/orders

@router.post(
    "/cart-resolution", 
    status_code=201, 
    response_model=ResolveItemsResponse
)
async def resolve_items_route(
    req: ResolveItemsRequest, 
    session=Depends(get_session)
):
    item_resolutions = get_item_resolutions(session, req.item_summaries)
    total_cent = calc_checkout_cart_total(item_resolutions)
    return ResolveItemsResponse(
        item_resolutions=item_resolutions, 
        total_cent=total_cent
    )

@router.post(
    "/checkout/guest",
    status_code=201,
    response_model=CheckoutResponse,
)
async def checkout_guest_route(
    req: CheckoutGuestRequest, 
    session=Depends(get_session)
):
    item_resolutions = get_item_resolutions(session, req.item_summaries)
    total_cent = calc_checkout_cart_total(item_resolutions)
    
    db_user = create_guest_user(
        session, req.user_summary
    )

    order_entity = create_order(
        session, 
        item_resolutions, 
        total_cent, 
        db_user, 
        req.address_detail, 
        req.delivery_note
    )
    stripe_session = create_stripe_session(order_entity, item_resolutions)
    return CheckoutResponse(
        stripe_session_url=stripe_session.url
    )


@router.post(
    "/checkout/user",
    status_code=201,
    response_model=CheckoutResponse,
)
async def checkout_user_route(
    req: CheckoutUserRequest,
    db_user=Depends(get_current_user),
    session=Depends(get_session),
):
    item_resolutions = get_item_resolutions(session, req.item_summaries)
    total_cent = calc_checkout_cart_total(item_resolutions)
    order_entity = create_order(
        session, 
        item_resolutions, 
        total_cent, 
        db_user, 
        req.address_detail, 
        req.delivery_note
    )
    stripe_session = create_stripe_session(order_entity, item_resolutions)

    return CheckoutResponse(
        stripe_session_url = stripe_session.url
    )


@router.get(
    "/user/order/{order_id}", 
    status_code=200, 
    response_model=GetUserOrderResponse
)
async def get_user_order_route(
    order_id: int, 
    _=Depends(get_current_user), 
    session=Depends(get_session)
):
    order_detail = get_order_detail(session, order_id)
    return GetUserOrderResponse(
        order_detail = order_detail
    )

@router.get(
    "/user/orders", 
    status_code=200, 
    response_model=GetUserOrdersResponse
)
async def get_user_orders_route(
    db_user=Depends(get_current_user), 
    session=Depends(get_session)
):
    order_summaries = get_order_summaries_with_user_id(session, db_user.id)
    return GetUserOrdersResponse(
        order_summaries = order_summaries
    )


@router.post(
    "/stripe/payment"
)
async def stripe_webhook(request: Request, session=Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise RequestException("Missing Stripe signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=get_config().stripe_payment_hook_key,
        )
    except stripe.error.SignatureVerificationError:
        raise RequestException("Invalid Stripe signature")
    except ValueError:
        raise RequestException("Invalid Stripe payload")

    stripe_session = event["data"]["object"]
    if (
        event["type"] == "checkout.session.async_payment_succeeded"
        or (
            event["type"] == "checkout.session.completed"
            and stripe_session['payment_status'] == "paid"
        )
    ): 
        handle_successful_payment(session, stripe_session)
    if event["type"] == "checkout.session.async_payment_failed":
        handle_failed_payment(session, stripe_session)

    return {"received": True}
