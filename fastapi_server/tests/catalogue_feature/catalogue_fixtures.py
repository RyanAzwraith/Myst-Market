
import pytest
from datetime import datetime, timedelta

from app.db.models import (
    Address,
    Order,
    OrderProduct,
)
from app.features.checkout.checkout_schemas import Status



@pytest.fixture
def address_factory(
    session,
    user,
):
    def create_address(
        *,
        user_id=user.id,
        country_code="AU",
        postcode="2300",
        state="NSW",
        city="Newcastle",
        street="123 Hunter St",
    ):
        address_entity = Address(
            user_id=user_id,
            country_code=country_code,
            postcode=postcode,
            state=state,
            city=city,
            street=street,
        )
        session.add(address_entity)
        session.commit()
        session.refresh(address_entity)
        return address_entity

    return create_address


@pytest.fixture
def address(
    address_factory,
):
    return address_factory()


@pytest.fixture
def address_seed(
    address_factory,
    address,
    user_seed,
):
    address_entities = [
        address_factory(
            user_id=user_seed[0].id,
            street="1 Alpha St",
        ),
        address_factory(
            user_id=user_seed[1].id,
            street="2 Bravo St",
        ),
    ]
    return address_entities


@pytest.fixture
def order_factory(
    session,
    user,
    address,
    product,
):
    def create_order(
        *,
        user_id=user.id,
        address_id=address.id,
        status_id=Status.Pending,
        delivery_note="leave at door",
        items=None,
    ):
        if items is None:
            items = [(product, 2)]
            
        cost = sum(p.price_aud_cent * q for p, q in items)
        order_entity = Order(
            user_id=user_id,
            status_id=status_id,
            address_id=address_id,
            cost_aud_cent=cost,
            delivery_note=delivery_note,
        )

        session.add(order_entity)
        session.flush()

        order_products = [
            OrderProduct(
                order_id=order_entity.id,
                product_id=p.id,
                quantity=q,
                unit_price_aud_cent=p.price_aud_cent
            )
            for p, q in items
        ]

        session.add_all(order_products)
        session.commit()
        session.refresh(order_entity)

        return order_entity

    return create_order


@pytest.fixture
def order(
    order_factory,
):
    return order_factory()


@pytest.fixture
def order_seed(
    order_factory,
    order,
    address_seed,
    address,
    user_seed,
    user,
    shop_seed,
):
    order_entities = [
        order_factory(
            user_id=user.id,
            address_id=address.id,
            items=[
                    (shop_seed["products"][0], 2),
                    (shop_seed["products"][3], 1),
            ],
        ),
        order_factory(
            user_id=user_seed[0].id,
            address_id=address_seed[0].id,
            items=[
                (shop_seed["products"][1], 1),
                (shop_seed["products"][2], 3),
            ],
        ),
    ]

    return order_entities

@pytest.fixture
def user_list_factory(
    user_factory,
):
    def create_users(
        count=5,
    ):
        return [
            user_factory(
                name=f"user{i}",
                email=f"user{i}@mail.com",
            )
            for i in range(count)
        ]

    return create_users