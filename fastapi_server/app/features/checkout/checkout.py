from fastapi import APIRouter
import stripe

router = APIRouter()

@router.post("/stripe/checkout")
def create_checkout():
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Hello World Product",
                    },
                    "unit_amount": 1000,  # $10.00
                },
                "quantity": 1,
            }
        ],
        success_url="http://localhost:5173/success",
        cancel_url="http://localhost:5173/cancel",
    )

    return {"url": session.url}