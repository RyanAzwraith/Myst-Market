from datetime import datetime, timedelta
from pathlib import Path
from shutil import copyfile

from app.db.models import (
    Address,
    Media,
    Order,
    OrderProduct,
    Payment,
    Product,
    Review,
    Sale,
    Stock,
    User,
)
from app.core import get_config
from app.features.user.user_service import hash_password

someDate = datetime.fromisoformat("2026-07-13T12:00:00")
_MEDIA_FILE_NAME = "test_image.png"


def _seed_media_file() -> None:
    source = (
        Path(__file__).resolve().parents[4]
        / "media"
        / "test_media"
        / _MEDIA_FILE_NAME
    )
    media_root = Path(get_config().media_url).expanduser()

    for entity_type in ("product", "sale"):
        target = media_root / entity_type / _MEDIA_FILE_NAME
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.resolve() != target.resolve():
            copyfile(source, target)


def dev_seed(session):
    users = [
        User(
            email="admin@mail.com",
            name="Admin User",
            is_admin=True,
            is_registered=True,
            password_hash=hash_password("password"),
        ),
        User(
            email="customer_one@mail.com",
            name="Myst Customer",
            is_registered=True,
            password_hash=hash_password("password"),
        ),
        User(email="customer_two@mail.com", deleted_at=someDate),
    ]

    session.add_all(users)
    session.flush()

    addresses = [
        Address(
            user_id=users[0].id,
            country_code="AU",
            state="NSW",
            city="Sydney",
            street="123 Test Street",
            postcode=2000,
        ),
        Address(
            user_id=users[1].id,
            country_code="AU",
            state="VIC",
            city="Melbourne",
            street="456 Market Lane",
            postcode=3000,
        ),
    ]

    session.add_all(addresses)
    session.flush()

    products = [
        Product(
            name="Sword of Dawn",
            category_id=3,
            rarity_id=4,
            price_aud_cent=25000,
            slug="sword-of-dawn",
            description="Ancient enchanted sword",
            units_sold=0,
        ),
        Product(
            name="Healing Potion",
            category_id=2,
            rarity_id=1,
            price_aud_cent=500,
            slug="healing-potion",
            description="Restores health",
            units_sold=1242,
        ),
        Product(
            name="Silver Amulet",
            category_id=4,
            rarity_id=2,
            price_aud_cent=7500,
            slug="silver-amulet",
            description="A charm for good fortune",
            units_sold=5,
        ),
        Product(
            name="Mystic Cloak",
            category_id=4,
            rarity_id=3,
            price_aud_cent=12000,
            slug="mystic-cloak",
            description="A cloak woven from enchanted threads.",
            units_sold=26,
        ),
        Product(
            name="Flame Essence",
            category_id=2,
            rarity_id=5,
            price_aud_cent=18000,
            slug="flame-essence",
            description="Pure elemental fire in a crystal vial.",
            units_sold=2,
        ),
        Product(
            name="Crystal Orb",
            category_id=1,
            rarity_id=4,
            price_aud_cent=16000,
            slug="crystal-orb",
            description="A shimmering focus for arcane sight.",
            units_sold=75,
        ),
        Product(
            name="Ranger's Bow",
            category_id=3,
            rarity_id=3,
            price_aud_cent=14000,
            slug="rangers-bow",
            description="A finely balanced bow for skilled archers.",
            units_sold=1294,
        ),
        Product(
            name="Potion of Luck",
            category_id=2,
            rarity_id=1,
            price_aud_cent=900,
            slug="potion-of-luck",
            description="A small tonic that brings good fortune.",
            units_sold=21542,
        ),
        Product(
            name="Guardian Shield",
            category_id=4,
            rarity_id=5,
            price_aud_cent=30000,
            slug="guardian-shield",
            description="A shield blessed to protect its wielder.",
            units_sold=6,
        ),
        Product(
            name="Elixir of Speed",
            category_id=2,
            rarity_id=3,
            price_aud_cent=8500,
            slug="elixir-of-speed",
            description="A bright potion that quickens your pace.",
            units_sold=574,
        ),
    ]

    session.add_all(products)
    session.flush()

    _seed_media_file()
    product_media = [
        Media(
            type="image",
            file_name=_MEDIA_FILE_NAME,
            entity_id=product.id,
            entity_type="product",
            alt_text=product.name,
            sort_order=0,
        )
        for product in products
    ]
    product_media.append(
        Media(
            type="image",
            file_name=_MEDIA_FILE_NAME,
            entity_id=products[0].id,
            entity_type="product",
            alt_text=f"{products[0].name} detail",
            sort_order=1,
        )
    )
    session.add_all(product_media)
    session.flush()

    stocks = [
        Stock(
            product_id=products[0].id,
            current=1,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[1].id,
            current=500,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[2].id,
            current=25,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[3].id,
            current=15,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[4].id,
            current=8,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[5].id,
            current=12,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[6].id,
            current=18,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[7].id,
            current=200,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[8].id,
            current=5,
            updated_at=someDate,
        ),
        Stock(
            product_id=products[9].id,
            current=30,
            updated_at=someDate,
        ),
    ]

    session.add_all(stocks)
    session.flush()

    sales = [
        Sale(
            discount_percent=20,
            start_at=someDate - timedelta(weeks=52),
            end_at=someDate + timedelta(weeks=520),
            name="Spring Sale",
            slug="spring-sale",
            description="Save 20% on selected items.",
            products=[products[1], products[4], products[7]],
        )
    ]

    session.add_all(sales)
    session.flush()

    sale_media = [
        Media(
            type="image",
            file_name=_MEDIA_FILE_NAME,
            entity_id=sale.id,
            entity_type="sale",
            alt_text=sale.name,
            sort_order=0,
        )
        for sale in sales
    ]
    session.add_all(sale_media)
    session.flush()

    reviews = [
        Review(
            user_id=users[1].id,
            product_id=products[0].id,
            rating=5,
            description="Fantastic craftsmanship and a perfect addition to my collection.",
        )
    ]

    session.add_all(reviews)
    session.flush()

    orders = [
        Order(
            user_id=users[1].id,
            status_id=1,
            address_id=addresses[1].id,
            cost_aud_cent=43000,
            delivery_note="Leave at reception if not home.",
        )
    ]

    session.add_all(orders)
    session.flush()

    order_products = [
        OrderProduct(
            order_id=orders[0].id,
            product_id=products[0].id,
            quantity=1,
            unit_price_aud_cent=25000,
        ),
        OrderProduct(
            order_id=orders[0].id,
            product_id=products[4].id,
            quantity=1,
            unit_price_aud_cent=18000,
        ),
    ]

    session.add_all(order_products)
    session.flush()

    payments = [
        Payment(
            amount_cent=43000,
            reference="PAY-12345",
            provider="stripe",
            currency_code=36,
            status="completed",
            created_at=someDate,
            updated_at=someDate,
            order_id=orders[0].id,
            user_id=users[1].id,
        )
    ]

    session.add_all(payments)
    session.flush()

    session.commit()
