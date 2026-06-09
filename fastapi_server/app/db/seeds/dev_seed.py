from datetime import datetime, timedelta

from app.db.models import (
    Address,
    Article,
    Media,
    MediaEntity,
    Order,
    OrderProduct,
    Payment,
    Product,
    Review,
    Sale,
    Stock,
    User,
)


def seed(db):
    users = [
        User(
            email="admin@mystmarket.com",
            name="Admin User",
            is_admin=True,
            is_registered=True,
            password_hash="dev-password",
        ),
        User(
            email="customer@mystmarket.com",
            name="Myst Customer",
            is_registered=True,
            password_hash="customer-password",
        ),
    ]

    db.add_all(users)
    db.flush()

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

    db.add_all(addresses)
    db.flush()

    products = [
        Product(
            name="Sword of Dawn",
            category_id=3,
            rarity_id=4,
            price_aud_cent=25000,
            slug="sword-of-dawn",
            description="Ancient enchanted sword",
        ),
        Product(
            name="Healing Potion",
            category_id=2,
            rarity_id=1,
            price_aud_cent=500,
            slug="healing-potion",
            description="Restores health",
        ),
        Product(
            name="Silver Amulet",
            category_id=4,
            rarity_id=2,
            price_aud_cent=7500,
            slug="silver-amulet",
            description="A charm for good fortune",
        ),
        Product(
            name="Mystic Cloak",
            category_id=4,
            rarity_id=3,
            price_aud_cent=12000,
            slug="mystic-cloak",
            description="A cloak woven from enchanted threads.",
        ),
        Product(
            name="Flame Essence",
            category_id=2,
            rarity_id=5,
            price_aud_cent=18000,
            slug="flame-essence",
            description="Pure elemental fire in a crystal vial.",
        ),
        Product(
            name="Crystal Orb",
            category_id=1,
            rarity_id=4,
            price_aud_cent=16000,
            slug="crystal-orb",
            description="A shimmering focus for arcane sight.",
        ),
        Product(
            name="Ranger's Bow",
            category_id=3,
            rarity_id=3,
            price_aud_cent=14000,
            slug="rangers-bow",
            description="A finely balanced bow for skilled archers.",
        ),
        Product(
            name="Potion of Luck",
            category_id=2,
            rarity_id=1,
            price_aud_cent=900,
            slug="potion-of-luck",
            description="A small tonic that brings good fortune.",
        ),
        Product(
            name="Guardian Shield",
            category_id=4,
            rarity_id=5,
            price_aud_cent=30000,
            slug="guardian-shield",
            description="A shield blessed to protect its wielder.",
        ),
        Product(
            name="Elixir of Speed",
            category_id=2,
            rarity_id=3,
            price_aud_cent=8500,
            slug="elixir-of-speed",
            description="A bright potion that quickens your pace.",
        ),
    ]

    db.add_all(products)
    db.flush()

    stocks = [
        Stock(
            product_id=products[0].id,
            current=10,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[1].id,
            current=500,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[2].id,
            current=25,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[3].id,
            current=15,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[4].id,
            current=8,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[5].id,
            current=12,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[6].id,
            current=18,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[7].id,
            current=200,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[8].id,
            current=5,
            updated_at=datetime.now(),
        ),
        Stock(
            product_id=products[9].id,
            current=30,
            updated_at=datetime.now(),
        ),
    ]

    db.add_all(stocks)
    db.flush()

    sales = [
        Sale(
            discount_percent=20,
            start_at=datetime.now() - timedelta(days=1),
            end_at=datetime.now() + timedelta(days=7),
            name="Spring Sale",
            description="Save 20% on selected items.",
            products=[products[2], products[4], products[7]],
        )
    ]
    
    db.add_all(sales)
    db.flush()

    reviews = [
        Review(
            user_id=users[1].id,
            product_id=products[0].id,
            rating=5,
            description="Fantastic craftsmanship and a perfect addition to my collection.",
        )
    ]

    db.add_all(reviews)
    db.flush()

    orders = [
        Order(
            user_id=users[1].id,
            status_id=1,
            address_id=addresses[1].id,
            cost_aud_cent=43000,
            delivery_note="Leave at reception if not home.",
        )
    ]

    db.add_all(orders)
    db.flush()

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

    db.add_all(order_products)
    db.flush()

    payments = [
        Payment(
            amount_cent=43000,
            reference="PAY-12345",
            provider="stripe",
            currency_code=36,
            status="completed",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            order_id=orders[0].id,
            user_id=users[1].id,
        )
    ]

    db.add_all(payments)
    db.flush()

    medias = [
        Media(
            type="image",
            file_name="sword_of_dawn.png",
            created_at=datetime.now(),
            alt_text="Sword of Dawn",
            sort_order=1,
        )
    ]

    db.add_all(medias)
    db.flush()

    media_entitys = [ 
        MediaEntity(
            entity_type="product",
            entity_id=products[0].id,
            media_id=medias[0].id,
        )
    ]

    db.add_all(media_entitys)
    db.flush()

    articles = [
            Article(
            created_at="2026-06-09",
            slug="sword-of-dawn-origin",
            title="Origins of the Sword of Dawn",
            desciption="A legendary weapon forged in the first light.",
            products=[products[0], products[2]],
        ),
        Article(
            created_at="2026-06-09",
            slug="mystic-cloak-history",
            title="Mystic Cloak: A History",
            desciption="The tale behind the enchanted cloak.",
            products=[products[3], products[5]],
        )
    ]

    db.add_all(articles)
    db.flush()

    db.commit()
