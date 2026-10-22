import stripe
import resend

from app.core import get_config, get_logger, AppError
from app.features.order.schema import Status


def create_stripe_session(order, items) -> str:
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "product_data": {
                            "name": item.product.name,
                        },
                        "unit_amount": item.unit_price_cent,
                    },
                    "quantity": item.quantity,
                }
                for item in items
            ],
            success_url=(
                f"{get_config().cors_origins[0]}/success"
            ),
            cancel_url=(
                f"{get_config().cors_origins[0]}/checkout"
            ),
            client_reference_id=str(order.user_id),
            metadata={"order_id": str(order.id)},
        )
    except stripe.error.StripeError as exc:
        raise AppError("Unable to create payment session") from exc

    if not checkout_session.url:
        raise AppError("Payment provider did not return a session URL")
    return checkout_session.url


def _get_order_id(stripe_session) -> int:
    metadata = stripe_session.get("metadata") or {}
    order_id = metadata.get("order_id")
    if order_id is None:
        raise AppError("Stripe session is missing order metadata")

    try:
        return int(order_id)
    except (TypeError, ValueError) as exc:
        raise AppError("Stripe session has an invalid order ID") from exc


def handle_successful_payment(db, stripe_session) -> None:
    order_id = _get_order_id(stripe_session)
    order = db.order.get(order_id)

    if order.status in {
        Status.pending,
        Status.error,
    }:
        db.order.patch_status(order_id, Status.processing.value)

    db.payment.create(
        amount_cent = order.cost_aud_cent,
        reference = stripe_session.payment_intent,
        provider = "stripe",
        currency_code = 36,
        status = "paid",
        order_id = order_id,
        user_id = order.user_id,
    )
    
    try:
        user = db.user.get(order.user_id)
        resend.Emails.send({
            "from": "payment_success@resend.dev",
            "to": user.email,
            "subject": "Payment Success",
            "html": f"""
            <h1>Payment Succeeded</h1>
            <h3> Order ID: {order.id} </h3>
            <h3> Order created on: {order.created_at} </h3>
            <h3> Amount: $ {round(order.cost_aud_cent / 100)} </h3>
            """,
        })
    except Exception:
        get_logger().resend.error(
            "Failed to send payment success email, "
            f"order id: {order.id}"
        )
    

    
def handle_failed_payment(db, stripe_session) -> None:
    order_id = _get_order_id(stripe_session)
    order = db.order.get(order_id)

    if order.status == Status.pending:
        db.order.patch_status(order_id, Status.error.value)

    user = db.user.get(order.user_id)
    try:
        resend.Emails.send(
            {
                "from": "payment_failed@resend.dev",
                "to": user.email,
                "subject": "Payment Failed",
                "html": f"""
                    <h1>Payment Failed</h1>
                    <h3>Order ID: {order.id}</h3>
                    <h3>Order created on: {order.created_at}</h3>
                    <h3>Amount: $ {order.cost_aud_cent / 100:.2f}</h3>
                """,
            }
        )
    except Exception:
        get_logger().resend.error(
            "Failed to send payment failed email, "
            f"order id: {order.id}"
        )