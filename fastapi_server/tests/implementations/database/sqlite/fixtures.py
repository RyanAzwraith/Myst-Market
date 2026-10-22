from datetime import date, timedelta

import pytest

from app.implementations.database.sqlite import models as _models
from app.implementations.database.sqlite.Base import Base
from app.implementations.database.sqlite.models.address import Address
from app.implementations.database.sqlite.models.item import Item
from app.implementations.database.sqlite.models.media import Media
from app.implementations.database.sqlite.models.order import Order
from app.implementations.database.sqlite.models.payment import Payment
from app.implementations.database.sqlite.models.product import Product
from app.implementations.database.sqlite.models.review import Review
from app.implementations.database.sqlite.models.sale import Sale
from app.implementations.database.sqlite.models.stock import Stock
from app.implementations.database.sqlite.models.user import User
from app.implementations.database.sqlite.sqlite import SqliteDatabase


def user_model_factory(
    user_id: int = 1,
    email: str = "user@example.com",
    name: str | None = "Test User",
    is_registered: bool = True,
    is_admin: bool = False,
    created_at: date | None = None,
    deleted_at: date | None = None,
) -> User:
    return User(
        id=user_id,
        email=email,
        name=name,
        is_registered=is_registered,
        is_admin=is_admin,
        created_at=created_at or date.today(),
        deleted_at=deleted_at,
    )


def product_model_factory(
    product_id: int = 1,
    name: str = "Battle Axe",
    slug: str = "battle-axe",
    price_aud_cent: int = 2500,
    category: str = "weapons",
    rarity: str = "rare",
    stock: int = 8,
    created_at: date | None = None,
    discontinued_at: date | None = None,
    units_sold: int = 12,
) -> Product:
    return Product(
        id=product_id,
        name=name,
        slug=slug,
        price_aud_cent=price_aud_cent,
        category=category,
        rarity=rarity,
        description="A reliable battle axe",
        created_at=created_at or date.today(),
        discontinued_at=discontinued_at,
        units_sold=units_sold,
        stock=Stock(current=stock),
    )


def sale_model_factory(
    sale_id: int = 1,
    name: str = "Summer Sale",
    slug: str = "summer-sale",
    discount_perc: int = 20,
    start_at: date | None = None,
    end_at: date | None = None,
) -> Sale:
    return Sale(
        id=sale_id,
        name=name,
        slug=slug,
        discount_perc=discount_perc,
        start_at=start_at or date.today() - timedelta(days=1),
        end_at=end_at or date.today() + timedelta(days=7),
        description="A seasonal sale",
    )


def address_model_factory(
    address_id: int = 1,
    user_id: int = 1,
) -> Address:
    return Address(
        id=address_id,
        user_id=user_id,
        country_code="AU",
        state="VIC",
        city="Melbourne",
        street="1 Test Street",
        postcode=3000,
    )


def order_model_factory(
    order_id: int = 1,
    user_id: int = 1,
    address_id: int = 1,
    status: str = "pending",
    cost_aud_cent: int = 4000,
    created_at: date | None = None,
    updated_at: date | None = None,
) -> Order:
    return Order(
        id=order_id,
        user_id=user_id,
        address_id=address_id,
        status=status,
        cost_aud_cent=cost_aud_cent,
        created_at=created_at or date.today(),
        updated_at=updated_at or date.today(),
        address=address_model_factory(
            address_id=address_id,
            user_id=user_id,
        ),
    )


def item_model_factory(
    order_id: int = 1,
    product_id: int = 1,
    sale_id: int | None = None,
    quantity: int = 2,
    unit_price_aud_cent: int = 2000,
) -> Item:
    return Item(
        order_id=order_id,
        product_id=product_id,
        sale_id=sale_id,
        quantity=quantity,
        unit_price_aud_cent=unit_price_aud_cent,
    )


def media_model_factory(
    media_id: int = 1,
    entity_id: int = 1,
    entity_type: str = "product",
    file_name: str = "battle-axe.png",
    media_type: str = "image",
    sort_order: int | None = 1,
) -> Media:
    return Media(
        id=media_id,
        entity_id=entity_id,
        entity_type=entity_type,
        file_name=file_name,
        type=media_type,
        alt_text="Battle axe",
        sort_order=sort_order,
    )


def review_model_factory(
    review_id: int = 1,
    user_id: int = 1,
    product_id: int = 1,
    rating: int = 5,
    description: str | None = "Excellent product",
    created_at: date | None = None,
) -> Review:
    return Review(
        id=review_id,
        user_id=user_id,
        product_id=product_id,
        rating=rating,
        description=description,
        created_at=created_at or date.today(),
    )


def payment_model_factory(
    payment_id: int = 1,
    amount_cent: int = 4000,
    reference: str = "pi_test_123",
    provider: str = "stripe",
    currency_code: str = "aud",
    status: str | None = "succeeded",
    order_id: int = 1,
    user_id: int = 1,
) -> Payment:
    return Payment(
        id=payment_id,
        amount_cent=amount_cent,
        reference=reference,
        provider=provider,
        currency_code=currency_code,
        status=status,
        order_id=order_id,
        user_id=user_id,
    )


@pytest.fixture
def sqlite_database(tmp_path):
    database_path = (tmp_path / "database.db").as_posix()
    database = SqliteDatabase(f"sqlite:///{database_path}")
    Base.metadata.create_all(database.engine)

    try:
        yield database
    finally:
        database.engine.dispose()


@pytest.fixture
def sqlite_session(sqlite_database):
    session_generator = sqlite_database.session_factory()
    session = next(session_generator)
    try:
        yield session
    finally:
        session_generator.close()


@pytest.fixture
def session_database(sqlite_database, sqlite_session):
    return sqlite_database.with_session(sqlite_session)
