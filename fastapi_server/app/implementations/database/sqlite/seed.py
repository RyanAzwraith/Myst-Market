"""Recreate and populate the development SQLite database.

Run from the fastapi_server directory with:
python -m app.implementations.database.sqlite.seed
"""

from __future__ import annotations

import random
import re
import shutil
from datetime import date, timedelta
from pathlib import Path

from faker import Faker

from app.core.config import init_config
from app.features.order.schema import Status
from app.features.auth.service import hash_password
from app.implementations.database.sqlite.Base import Base
from app.implementations.database.sqlite.models import (
    Address,
    Item,
    Media,
    Order,
    Payment,
    Product,
    Review,
    Sale,
    Stock,
    User,
)
from app.implementations.database.sqlite.sqlite import SqliteDatabase


SEED = 20261022
PRODUCT_COUNT = 55
PASSWORD = "123"
ADMIN_EMAIL = "admin@mail.com"
ADMIN_PASSWORD = "123"
MEDIA_FILE_NAME = "test_image.png"

CATEGORIES = (
    "weapons",
    "armaments",
    "apparel",
    "accessories",
    "potions",
    "artifacts",
)
RARITIES = ("common", "uncommon", "rare", "epic", "legendary")
STATES = ("VIC", "NSW", "QLD", "WA", "SA", "TAS")
ORDER_STATUSES = (
    Status.pending.value,
    Status.processing.value,
    Status.shipped.value,
    Status.delivered.value,
    Status.cancelled.value,
    Status.error.value,
)


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _create_users(fake: Faker) -> list[User]:
    users = [
        User(
            email=ADMIN_EMAIL,
            name="Market Administrator",
            is_admin=True,
            is_registered=True,
            password_hash=hash_password(ADMIN_PASSWORD),
        )
    ]

    for index in range(1, 8):
        users.append(
            User(
                email=f"{fake.unique.user_name()}{index}@myst-market.test",
                name=fake.name(),
                is_admin=False,
                is_registered=index != 7,
                password_hash=(
                    hash_password(PASSWORD) if index != 7 else None
                ),
                deleted_at=(
                    date.today() - timedelta(days=30)
                    if index == 7
                    else None
                ),
            )
        )
    return users


def _create_addresses(fake: Faker, users: list[User]) -> list[Address]:
    addresses = []
    for user in users:
        for _ in range(2 if user.id % 3 == 0 else 1):
            addresses.append(
                Address(
                    user=user,
                    country_code="AU",
                    state=fake.random_element(STATES),
                    city=fake.city(),
                    street=fake.street_address(),
                    postcode=fake.random_int(min=2000, max=7999),
                )
            )
    return addresses


def _create_products(fake: Faker) -> list[Product]:
    products = []
    for index in range(1, PRODUCT_COUNT + 1):
        name = f"{fake.word().title()} {fake.word().title()} {index}"
        products.append(
            Product(
                name=name,
                slug=_slug(name),
                category=fake.random_element(CATEGORIES),
                rarity=fake.random_element(RARITIES),
                price_aud_cent=fake.random_int(
                    min=800,
                    max=18000,
                    step=100,
                ),
                description=fake.paragraph(nb_sentences=2),
                discontinued_at=(
                    date.today() - timedelta(days=10)
                    if index in {53, 54, 55}
                    else None
                ),
                units_sold=fake.random_int(min=0, max=90),
                stock=Stock(
                    current=(
                        0
                        if index in {11, 22, 33}
                        else fake.random_int(min=1, max=40)
                    )
                ),
            )
        )
    return products


def _create_sales(fake: Faker) -> list[Sale]:
    today = date.today()
    sales = [
        Sale(
            name="Mystic Market Sale",
            slug="mystic-market-sale",
            discount_perc=20,
            start_at=today - timedelta(days=10),
            end_at=today + timedelta(days=21),
            description=fake.paragraph(nb_sentences=2),
        ),
        Sale(
            name="Weekend Relics",
            slug="weekend-relics",
            discount_perc=10,
            start_at=today - timedelta(days=2),
            end_at=today + timedelta(days=4),
            description=fake.paragraph(nb_sentences=2),
        ),
        Sale(
            name="Coming Soon Collection",
            slug="coming-soon-collection",
            discount_perc=15,
            start_at=today + timedelta(days=5),
            end_at=today + timedelta(days=15),
            description=fake.paragraph(nb_sentences=2),
        ),
        Sale(
            name="Archived Treasures",
            slug="archived-treasures",
            discount_perc=30,
            start_at=today - timedelta(days=45),
            end_at=today - timedelta(days=15),
            description=fake.paragraph(nb_sentences=2),
        ),
    ]
    return sales


def _assign_sales(products: list[Product], sales: list[Sale]) -> None:
    sales[0].products.extend(products[:18])
    sales[1].products.extend(products[12:28])
    sales[2].products.extend(products[28:40])
    sales[3].products.extend(products[40:50])


def _active_sale(product: Product) -> Sale | None:
    today = date.today()
    active_sales = [
        sale
        for sale in product.sales
        if sale.start_at <= today <= sale.end_at
    ]
    if not active_sales:
        return None
    return max(active_sales, key=lambda sale: sale.discount_perc)


def _create_orders(
    users: list[User],
    addresses: list[Address],
    products: list[Product],
) -> list[Order]:
    addresses_by_user: dict[int, list[Address]] = {}
    for address in addresses:
        addresses_by_user.setdefault(address.user.id, []).append(address)

    orders = []
    for index in range(12):
        user = users[(index + 1) % len(users)]
        order_date = date.today() - timedelta(days=index * 3)
        order = Order(
            user=user,
            address=addresses_by_user[user.id][0],
            status=ORDER_STATUSES[index % len(ORDER_STATUSES)],
            created_at=order_date,
            updated_at=order_date,
            delivery_note=(
                "Leave at the front door"
                if index % 3 == 0
                else None
            ),
        )

        total = 0
        for item_index in range(2 + index % 3):
            product = products[(index * 4 + item_index) % len(products)]
            sale = _active_sale(product)
            quantity = 1 + (index + item_index) % 3
            unit_price = product.price_aud_cent
            if sale is not None:
                unit_price = round(
                    unit_price * (100 - sale.discount_perc) / 100
                )
            total += unit_price * quantity
            order.items.append(
                Item(
                    product=product,
                    sale=sale,
                    quantity=quantity,
                    unit_price_aud_cent=unit_price,
                )
            )

        order.cost_aud_cent = total
        orders.append(order)
    return orders


def _create_payments(orders: list[Order]) -> list[Payment]:
    paid_statuses = {
        Status.processing.value,
        Status.shipped.value,
        Status.delivered.value,
    }
    payments = []
    for order in orders:
        if order.status not in paid_statuses:
            continue
        payments.append(
            Payment(
                amount_cent=order.cost_aud_cent,
                reference=f"seed_payment_{order.id}",
                provider="stripe",
                currency_code="AUD",
                status="paid",
                order=order,
                user=order.user,
            )
        )
    return payments


def _create_reviews(
    fake: Faker,
    users: list[User],
    products: list[Product],
) -> list[Review]:
    reviews = []
    review_keys = set()
    for index in range(28):
        user = users[(index + 2) % len(users)]
        product = products[(index * 2 + 3) % len(products)]
        key = (user.id, product.id)
        if key in review_keys:
            continue
        review_keys.add(key)
        reviews.append(
            Review(
                user=user,
                product=product,
                rating=1 + index % 5,
                description=fake.paragraph(nb_sentences=1),
                created_at=date.today() - timedelta(days=index),
            )
        )
    return reviews


def _create_media(
    products: list[Product],
    sales: list[Sale],
) -> list[Media]:
    media = [
        Media(
            type="image",
            file_name=MEDIA_FILE_NAME,
            entity_id=product.id,
            entity_type="product",
            alt_text=product.name,
            sort_order=1,
        )
        for product in products
    ]
    media.extend(
        Media(
            type="image",
            file_name=MEDIA_FILE_NAME,
            entity_id=sale.id,
            entity_type="sale",
            alt_text=sale.name,
            sort_order=1,
        )
        for sale in sales
    )
    return media


def _ensure_media_file() -> None:
    media_root = Path(__file__).resolve().parents[5] / "media"
    source = media_root / "test_media" / MEDIA_FILE_NAME
    if not source.is_file():
        raise FileNotFoundError(
            f"Seed media file is missing: {source}"
        )

    for entity_type in ("product", "sale"):
        destination_directory = media_root / entity_type
        destination_directory.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(
            source,
            destination_directory / MEDIA_FILE_NAME,
        )


def seed_database(database_url: str, seed: int = SEED) -> None:
    Faker.seed(seed)
    random.seed(seed)
    fake = Faker("en_AU")
    database = SqliteDatabase(database_url)

    try:
        _ensure_media_file()
        Base.metadata.drop_all(database.engine)
        Base.metadata.create_all(database.engine)

        with database.make_session() as session:
            with session.begin():
                users = _create_users(fake)
                session.add_all(users)
                session.flush()

                addresses = _create_addresses(fake, users)
                products = _create_products(fake)
                sales = _create_sales(fake)
                _assign_sales(products, sales)
                session.add_all(addresses + products + sales)
                session.flush()

                orders = _create_orders(users, addresses, products)
                session.add_all(orders)
                session.flush()

                session.add_all(_create_payments(orders))
                session.add_all(_create_reviews(fake, users, products))
                session.add_all(_create_media(products, sales))

        print(f"Seeded {database_url}")
        print(f"Products: {len(products)}")
        print(f"Users: {len(users)}")
        print(f"Orders: {len(orders)}")
        print(f"Media entries: {len(products) + len(sales)}")
        print(f"Admin login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
        print(f"User password: {PASSWORD}")
    finally:
        database.engine.dispose()


def main() -> None:
    config = init_config()
    if config.database_implementation != "sqlite":
        raise RuntimeError("The seed script only supports SQLite databases")
    if config.environment not in {"dev", "development", "test", "testing"}:
        raise RuntimeError(
            "Database seeding is only allowed in a development environment"
        )
    seed_database(config.database_url)


if __name__ == "__main__":
    main()


# python -m app.implementations.database.sqlite.seed