import pytest
from datetime import datetime, timedelta

from app.db.models import (
    Category,
    Rarity,
    Product,
    Sale,
    Stock,
)

now = datetime.now()

@pytest.fixture
def category(session):
    category = Category(name="Artifacts")
    session.add(category)
    session.commit()
    return category

@pytest.fixture
def rarity(session):
    rarity = Rarity(name="Common", order=1)
    session.add(rarity)
    session.commit()
    return rarity

@pytest.fixture
def product(session, category, rarity):
    product = Product(
        name="Sword of Dawn",
        price_aud_cent=25000,
        slug="sword-of-dawn",
        description="Ancient enchanted sword",
        units_sold= 0,
        category=category,
        rarity=rarity
    )
    session.add(product)
    session.commit()
    return product

@pytest.fixture
def stock(session, product):
    stock = Stock(
        product=product,
        current=1,
        updated_at=now,
    )
    session.add(stock)
    session.commit()
    return stock

@pytest.fixture
def sale(session, product):
    sale =  Sale(
            discount_percent=20,
            start_at=now - timedelta(days=1),
            end_at=now + timedelta(days=7),
            name="Spring Sale",
            slug="spring-sale",
            description="Save 20% on selected items.",
            products=[product],
        )
    session.add(sale)
    session.commit()
    return sale

@pytest.fixture
def shop_seed(session, category, rarity, product, stock, sale):
    categories = [
        Category(name="Consumables"),
        Category(name="Weapons"),
        Category(name="Accessories"),
    ]

    rarities = [
        Rarity(name="Uncommon", order=2),
        Rarity(name="Rare", order=3),
        Rarity(name="Epic", order=4),
        Rarity(name="Legendary", order=5),
    ]
    session.add_all(categories)
    session.flush()
    session.add_all(rarities)
    session.flush()

    products = [
        Product(
            name="Healing Potion",
            price_aud_cent=500,
            slug="healing-potion",
            description="Restores health",
            units_sold= 1242,
            category=categories[1],
            rarity=rarities[0]
        ),
        Product(
            name="Silver Amulet",
            price_aud_cent=7500,
            slug="silver-amulet",
            description="A charm for good fortune",
            units_sold= 5,
            category=categories[0],
            rarity=rarities[1]
        ),
        Product(
            name="Mystic Cloak",
            price_aud_cent=12000,
            slug="mystic-cloak",
            description="A cloak woven from enchanted threads.",
            units_sold= 26,
            category=categories[2],
            rarity=rarities[2]
        ),
        Product(
            name="Flame Essence",
            price_aud_cent=18000,
            slug="flame-essence",
            description="Pure elemental fire in a crystal vial.",
            units_sold= 2,
            category=categories[1],
            rarity=rarities[2]
        ),
        Product(
            name="Crystal Orb",
            price_aud_cent=16000,
            slug="crystal-orb",
            description="A shimmering focus for arcane sight.",
            units_sold= 75,
            category=categories[0],
            rarity=rarities[3],
            discontinued_at=now,
        ),
    ]

    session.add_all(products)
    session.flush()

    stocks = [
        Stock(
            product=products[0],
            current=6,
            updated_at=now,
        ),
        Stock(
            product=products[1],
            current=500,
            updated_at=now,
        ),
        Stock(
            product=products[2],
            current=0,
            updated_at=now,
        ),
        Stock(
            product=products[3],
            current=15,
            updated_at=now,
        ),
        Stock(
            product=products[4],
            current=8,
            updated_at=now,
        )
    ]

    sales = [
        Sale(
            discount_percent=10,
            start_at=now - timedelta(days=1),
            end_at=now + timedelta(days=7),
            name="Summer Sale",
            slug="summer-sale",
            description="Save 10% on selected items.",
            products=[products[2], products[4]],
        )
    ]
    session.add_all(stocks)
    session.add_all(sales)
    session.commit()

    return {
        'categories': categories,
        'rarities': rarities,
        'sales': sales,
        'products': products,
    }
