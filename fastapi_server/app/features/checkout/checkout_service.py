import stripe
import resend
from datetime import datetime

from app.core import get_logger
from app.db.models import (
    User,
    Product,
    Order,
    Address,
    Payment,
    OrderProduct,
)
from app.core.exceptions import (
    ContentNotFoundException,
    ConflictException
)
from app.features.shop.shop_service import (
    product_query,
    get_discounted_price,
    apply_product_filters
)

from .checkout_schemas import (
    UserSummary,
    ProductSummary,
    ItemResolution,
    OrderDetail,
    OrderSummary,
    Status,
)

def get_item_resolutions(
    session, item_summaries
) -> list[ItemResolution]:
    
    item_quantity_by_product_id = {
        o.product_id: o.quantity
        for o in item_summaries
    }
    query = product_query(session)
    query = apply_product_filters(query)
    query = query.filter(
            Product.id.in_([e.product_id for e in item_summaries])
        )
    results = query.all()

    item_resolutions = []
    for product_entity, sale_entity in results:
        unit_price_cent = get_discounted_price(product_entity, sale_entity)
        quantity = item_quantity_by_product_id[product_entity.id]

        item_resolutions.append(
            ItemResolution(
                product_summary = ProductSummary.model_validate(product_entity),
                quantity = quantity,
                unit_price_cent = unit_price_cent,
                line_total_cent = quantity * unit_price_cent,
                on_sale = sale_entity is not None
            )
        )
    return item_resolutions


def calc_checkout_cart_total(
    item_resolutions
) -> int:
    
    return sum([o.line_total_cent for o in item_resolutions])

def address_to_string(address_entity):
    return (
        f"{address_entity.street}, "
        f"{address_entity.city}, "
        f"{address_entity.state}, "
        f"{address_entity.postcode}, "
        f"{address_entity.country_code}"
    )

def create_guest_user(session, userSummary: UserSummary) -> User:
    db_user = session.query(User).filter(User.email == userSummary.email).first()
    if not db_user:
        db_user = User(
            email=userSummary.email,
            name=userSummary.name,
            is_registered=False
        )
        session.add(db_user)    
        session.commit()
        session.refresh(db_user)
    return db_user

def create_order(
    session, 
    item_resolutions, 
    total_cent, 
    user_entity, 
    address_detail, 
    delivery_note
) -> Order:
    
    address_entity = Address(
        user_id = user_entity.id,
        **address_detail.model_dump()
    )
    session.add(address_entity)
    session.flush()

    order_entity = Order(
        user_id = user_entity.id,
        status_id = Status.Pending,
        address_id = address_entity.id,
        cost_aud_cent = total_cent,
        delivery_note = delivery_note,
    )
    session.add(order_entity)
    session.flush()

    order_product_entities = [
        OrderProduct(
            order_id = order_entity.id,
            product_id = o.product_summary.id,
            quantity = o.quantity,
            unit_price_aud_cent = o.unit_price_cent,
        ) for o in item_resolutions
    ]

    session.add_all(order_product_entities)
    session.commit()
    session.refresh(order_entity)

    try:
        resend.Emails.send({
            "from": "order@resend.dev",
            "to": user_entity.email,
            "subject": "New Order",
            "html": f"""
                <h1>New Order has been created</h1>
                <h3> Order ID: {order_entity.id} </h3>
                <h3> Order created on: {order_entity.created_at} </h3>
                <h3> Amount: $ {round(order_entity.cost_aud_cent/100)} </h3>
            """
        })
    except Exception:
        get_logger().resend.error(f"Failed to send payment success email, order id: {order_entity.id}")

    return order_entity

def create_stripe_session(
    order_entity, item_resolutions
) -> stripe.checkout.Session:
    
    return stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "aud",
                    "product_data": {
                        "name": o.product_summary.name,
                    },
                    "unit_amount": o.unit_price_cent,
                },
                "quantity": o.quantity,
            } for o in item_resolutions
        ],
        success_url="http://localhost:5173/success",
        cancel_url="http://localhost:5173/checkout",

        client_reference_id=str(order_entity.user_id),
        metadata={"order_id": str(order_entity.id)},
    )


def get_order_detail(
    session, order_id
) -> OrderDetail:
    
    order_entity = session.query(Order).filter(Order.id == order_id).first()
    if not order_entity:
        raise ContentNotFoundException(
            "Order Not Found", details={"order_id": order_id}
        )

    item_resolutions = []
    for order_product_entity in order_entity.order_products:
        product_entity = order_product_entity.product
        quantity = order_product_entity.quantity
        price = order_product_entity.unit_price_aud_cent

        item_resolutions.append(
            ItemResolution(
                product_summary = ProductSummary.model_validate(product_entity),
                quantity = quantity,
                unit_price_cent = price,
                line_total_cent = quantity * price,
                on_sale = product_entity.price_aud_cent != price
            )
        )
    return OrderDetail(
        address_string = address_to_string(order_entity.address),
        item_resolutions = item_resolutions,
        cost_aud_cent = order_entity.cost_aud_cent,
        created_at = order_entity.created_at,
    )

def get_order_summaries_with_user_id(
    session, user_id
) -> list[OrderSummary]:
    
    order_entities = (
        session.query(Order)
        .filter(Order.user_id == user_id)
        .all()
    )
    
    return [OrderSummary(
        order_id = o.id,
        created_at = o.created_at,
        total_cent = o.cost_aud_cent,
        status = Status[o.status.name]
    ) for o in order_entities]

def handle_successful_payment(session, stripe_session):
    order_id = int(stripe_session.metadata['order_id'])
    order_entity = session.query(Order).filter(Order.id == order_id).first()
    if not order_entity:
        raise ContentNotFoundException(
            "Order Not Found", details={"order_id": order_id}
        )
    if order_entity.status_id != Status.Pending:
        raise ConflictException(
            f"order already paid, order id: {order_entity.id}"
        )

    payment_entity = session.query(Payment).filter(
        Payment.reference == stripe_session.payment_intent
    ).first()
    if payment_entity:
        return
    
    user_entity = order_entity.user
    now = datetime.now()
    payment_entity = Payment(
        amount_cent = order_entity.cost_aud_cent,
        reference= stripe_session.payment_intent,
        provider= "stripe",
        currency_code= 36,
        status= "paid",
        created_at=now,
        updated_at=now,
        order_id=order_entity.id,
        user_id= user_entity.id
    )
    order_entity.status_id = Status.Processing
    session.add(payment_entity)
    session.commit()

    try:
        resend.Emails.send({
            "from": "payment_success@resend.dev",
            "to": user_entity.email,
            "subject": "Payment Success",
            "html": f"""
                <h1>Payment Succeeded</h1>
                <h3> Order ID: {order_entity.id} </h3>
                <h3> Order created on: {order_entity.created_at} </h3>
                <h3> Amount: $ {round(order_entity.cost_aud_cent/100)} </h3>
            """
        })
    except Exception:
        get_logger().resend.error(f"Failed to send payment success email, order id: {order_entity.id}")

def handle_failed_payment(session, stripe_session):
    order_id = int(stripe_session.metadata['order_id'])
    order_entity = session.query(Order).filter(Order.id == order_id).first()
    if not order_entity:
        raise ContentNotFoundException(
            "Order Not Found", details={"order_id": order_id}
        )
    user_entity = order_entity.user

    try:
        resend.Emails.send({
            "from": "payment_failed@resend.dev",
            "to": user_entity.email,
            "subject": "Payment Failed",
            "html": f"""
                <h1>Payment Failed</h1>
                <h3> Order ID: {order_entity.id} </h3>
                <h3> Order created on: {order_entity.created_at} </h3>
                <h3> Amount: $ {round(order_entity.cost_aud_cent/100)} </h3>
            """
        })
    except Exception:
        get_logger().resend.error(f"Failed to send payment failed email, order id: {order_entity.id}")



