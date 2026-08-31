from datetime import datetime, timedelta

from app.db.models import (
    Address,
    Order,
    OrderProduct,
    Payment,
    Product,
    Review,
    Sale,
    Stock,
    User,
)
from app.features.user.user_service import hash_password

SEED_DATE = datetime(2026, 7, 13, 12, 0)
PASSWORD = "password"
HISTORY_DAYS = 1095
ORDER_STATUSES = (
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "error",
)


def _product_data() -> list[dict[str, object]]:
    return [
        {
            "name": "Sword of Dawn",
            "category": "weapons",
            "rarity": "epic",
            "price": 25000,
            "description": "An ancient blade that catches the first light of day.",
        },
        {
            "name": "Healing Potion",
            "category": "potions",
            "rarity": "common",
            "price": 500,
            "description": "A dependable restorative tonic for long adventures.",
        },
        {
            "name": "Silver Amulet",
            "category": "accessories",
            "rarity": "uncommon",
            "price": 7500,
            "description": "A polished charm said to turn aside ill fortune.",
        },
        {
            "name": "Mystic Cloak",
            "category": "apparel",
            "rarity": "rare",
            "price": 12000,
            "description": "A cloak woven from threads that shimmer like starlight.",
        },
        {
            "name": "Flame Essence",
            "category": "potions",
            "rarity": "legendary",
            "price": 18000,
            "description": "Pure elemental fire sealed inside a crystal vial.",
        },
        {
            "name": "Crystal Orb",
            "category": "artifacts",
            "rarity": "epic",
            "price": 16000,
            "description": "A shimmering focus that reveals hidden magical traces.",
        },
        {
            "name": "Ranger's Bow",
            "category": "weapons",
            "rarity": "rare",
            "price": 14000,
            "description": "A finely balanced bow made for skilled archers.",
        },
        {
            "name": "Potion of Luck",
            "category": "potions",
            "rarity": "common",
            "price": 900,
            "description": "A bright tonic that brings good fortune for a short while.",
        },
        {
            "name": "Guardian Shield",
            "category": "armaments",
            "rarity": "legendary",
            "price": 30000,
            "description": "A shield blessed to protect its wielder from harm.",
        },
        {
            "name": "Elixir of Speed",
            "category": "potions",
            "rarity": "rare",
            "price": 8500,
            "description": "A vivid elixir that quickens the drinker's pace.",
        },
        {
            "name": "Moonlit Dagger",
            "category": "weapons",
            "rarity": "uncommon",
            "price": 6800,
            "description": "A slim dagger whose edge glows under a clear night sky.",
        },
        {
            "name": "Runic Battleaxe",
            "category": "weapons",
            "rarity": "epic",
            "price": 22000,
            "description": "A heavy axe engraved with runes of unstoppable force.",
        },
        {
            "name": "Iron Sentinel Helm",
            "category": "armaments",
            "rarity": "common",
            "price": 4200,
            "description": "A sturdy helm that has guarded many frontier outposts.",
        },
        {
            "name": "Dragonscale Cuirass",
            "category": "armaments",
            "rarity": "legendary",
            "price": 48000,
            "description": "A light cuirass crafted from the scales of an elder dragon.",
        },
        {
            "name": "Warden's Gauntlets",
            "category": "armaments",
            "rarity": "rare",
            "price": 11000,
            "description": "Reinforced gloves that steady a defender's grip.",
        },
        {
            "name": "Silk Traveler's Hood",
            "category": "apparel",
            "rarity": "uncommon",
            "price": 3600,
            "description": "A comfortable hood with pockets for maps and small tools.",
        },
        {
            "name": "Emberweave Tunic",
            "category": "apparel",
            "rarity": "rare",
            "price": 9800,
            "description": "Warm travelwear spun with threads that retain gentle heat.",
        },
        {
            "name": "Crown of Tides",
            "category": "apparel",
            "rarity": "epic",
            "price": 27500,
            "description": "A ceremonial crown that hums with the sound of distant waves.",
        },
        {
            "name": "Whispering Scarf",
            "category": "apparel",
            "rarity": "common",
            "price": 1800,
            "description": "A soft scarf embroidered with tiny protective sigils.",
        },
        {
            "name": "Mantle of the High Mage",
            "category": "apparel",
            "rarity": "legendary",
            "price": 52000,
            "description": "A magnificent mantle reserved for the greatest spellcasters.",
        },
        {
            "name": "Sunstone Pendant",
            "category": "accessories",
            "rarity": "rare",
            "price": 7600,
            "description": "A warm golden pendant that brightens in the presence of danger.",
        },
        {
            "name": "Merchant's Signet",
            "category": "accessories",
            "rarity": "common",
            "price": 1200,
            "description": "A practical silver signet recognized in trading houses.",
        },
        {
            "name": "Aether Lens",
            "category": "accessories",
            "rarity": "epic",
            "price": 19500,
            "description": "A precision lens that makes invisible currents visible.",
        },
        {
            "name": "Boots of Soft Steps",
            "category": "accessories",
            "rarity": "uncommon",
            "price": 5400,
            "description": "Well-made boots that muffle footsteps on stone and timber.",
        },
        {
            "name": "Starfall Circlet",
            "category": "accessories",
            "rarity": "legendary",
            "price": 41000,
            "description": "A delicate circlet set with a fragment of fallen starlight.",
        },
        {
            "name": "Elixir of Focus",
            "category": "potions",
            "rarity": "uncommon",
            "price": 2400,
            "description": "A clear elixir that sharpens concentration during study.",
        },
        {
            "name": "Bottled Thunder",
            "category": "potions",
            "rarity": "epic",
            "price": 13500,
            "description": "A volatile draught crackling with captured storm energy.",
        },
        {
            "name": "Antidote Draught",
            "category": "potions",
            "rarity": "common",
            "price": 700,
            "description": "A reliable remedy for common venoms and poisons.",
        },
        {
            "name": "Phoenix Rebirth Tonic",
            "category": "potions",
            "rarity": "legendary",
            "price": 60000,
            "description": "A rare tonic infused with a phoenix's renewing spark.",
        },
        {
            "name": "Night Vision Serum",
            "category": "potions",
            "rarity": "rare",
            "price": 4600,
            "description": "A dark blue serum that helps the eyes adjust to shadows.",
        },
        {
            "name": "Tome of Forgotten Roads",
            "category": "artifacts",
            "rarity": "uncommon",
            "price": 6400,
            "description": "A travel journal whose maps change with the seasons.",
        },
        {
            "name": "Clockwork Scarab",
            "category": "artifacts",
            "rarity": "common",
            "price": 2800,
            "description": "A curious mechanical companion with a wind-up heart.",
        },
        {
            "name": "Mirror of True Names",
            "category": "artifacts",
            "rarity": "epic",
            "price": 24000,
            "description": "A black mirror that reflects the truth behind disguises.",
        },
        {
            "name": "Compass of Returning",
            "category": "artifacts",
            "rarity": "rare",
            "price": 8900,
            "description": "A brass compass that always points toward its owner's home.",
        },
        {
            "name": "Heart of the Old Mountain",
            "category": "artifacts",
            "rarity": "legendary",
            "price": 75000,
            "description": "A warm stone pulsing with the memory of ancient peaks.",
        },
        {
            "name": "Copper Recurve",
            "category": "weapons",
            "rarity": "common",
            "price": 3200,
            "description": "A compact bow favored by scouts and young adventurers.",
        },
        {
            "name": "Frostbite Spear",
            "category": "weapons",
            "rarity": "rare",
            "price": 15500,
            "description": "A spearhead cold enough to leave frost on its target.",
        },
        {
            "name": "Voidglass Rapier",
            "category": "weapons",
            "rarity": "legendary",
            "price": 56000,
            "description": "A near-weightless rapier forged from translucent shadow glass.",
        },
        {
            "name": "Duelist's Sabre",
            "category": "weapons",
            "rarity": "uncommon",
            "price": 7200,
            "description": "A quick, elegant sabre balanced for formal duels.",
        },
        {
            "name": "Meteor Hammer",
            "category": "weapons",
            "rarity": "epic",
            "price": 28500,
            "description": "A chained hammer whose head fell from the evening sky.",
        },
        {
            "name": "Padded Guard Vest",
            "category": "armaments",
            "rarity": "common",
            "price": 2900,
            "description": "A flexible vest offering dependable protection on patrol.",
        },
        {
            "name": "Stormforged Bracers",
            "category": "armaments",
            "rarity": "epic",
            "price": 21000,
            "description": "Bracers that store a charge and release it on impact.",
        },
        {
            "name": "Aegis of Quiet Waters",
            "category": "armaments",
            "rarity": "legendary",
            "price": 65000,
            "description": "A broad shield that silences hostile magic nearby.",
        },
        {
            "name": "Scaled Greaves",
            "category": "armaments",
            "rarity": "uncommon",
            "price": 5800,
            "description": "Light greaves that protect the legs without limiting movement.",
        },
        {
            "name": "Runebound War Mask",
            "category": "armaments",
            "rarity": "rare",
            "price": 12800,
            "description": "A carved mask worn by champions of the northern clans.",
        },
        {
            "name": "Raincloak",
            "category": "apparel",
            "rarity": "common",
            "price": 2200,
            "description": "A practical waterproof cloak for wet roads and cold camps.",
        },
        {
            "name": "Velvet Court Coat",
            "category": "apparel",
            "rarity": "uncommon",
            "price": 6700,
            "description": "A tailored coat suitable for courtly gatherings and feasts.",
        },
        {
            "name": "Glimmerthread Gloves",
            "category": "apparel",
            "rarity": "rare",
            "price": 4300,
            "description": "Fine gloves that leave a brief trail of harmless sparks.",
        },
        {
            "name": "Regalia of the First King",
            "category": "apparel",
            "rarity": "legendary",
            "price": 90000,
            "description": "An immaculate ceremonial set from the kingdom's founding.",
        },
        {
            "name": "Traveler's Utility Belt",
            "category": "accessories",
            "rarity": "common",
            "price": 1600,
            "description": "A rugged belt with room for tools, pouches, and provisions.",
        },
        {
            "name": "Locket of Echoes",
            "category": "accessories",
            "rarity": "epic",
            "price": 17200,
            "description": "A silver locket that preserves a treasured spoken memory.",
        },
        {
            "name": "Gilded Eye Monocle",
            "category": "accessories",
            "rarity": "rare",
            "price": 10300,
            "description": "An ornate monocle that highlights hidden inscriptions.",
        },
        {
            "name": "Lucky Brass Button",
            "category": "accessories",
            "rarity": "uncommon",
            "price": 900,
            "description": "A small collectible charm with an unexpectedly good reputation.",
        },
    ]


def _make_users() -> list[User]:
    names = (
        "Aria Stone",
        "Bram Copperfield",
        "Cleo Nightbloom",
        "Darius Vale",
        "Elara Moss",
        "Finn Ember",
        "Greta Thorn",
        "Hugo Frost",
        "Iris Silver",
        "Jasper Reed",
        "Kira Dawn",
        "Luca Wren",
    )
    users = [
        ("admin@mail.com", "Admin User", True, True),
        *[
            (
                f"customer{index:03d}@mail.com",
                f"{names[index % len(names)]} {index // len(names) + 1}",
                False,
                index % 17 != 0,
            )
            for index in range(1, 300)
        ],
    ]
    return [
        User(
            email=email,
            name=name,
            is_admin=is_admin,
            is_registered=is_registered,
            password_hash=hash_password(PASSWORD) if is_registered else None,
            created_at=SEED_DATE.date()
            - timedelta(days=(index * 29) % HISTORY_DAYS),
        )
        for index, (email, name, is_admin, is_registered) in enumerate(users)
    ]


def _make_addresses(users: list[User]) -> list[Address]:
    address_data = (
        ("NSW", "Sydney", "Market Street", 2000),
        ("VIC", "Melbourne", "Collins Street", 3000),
        ("QLD", "Brisbane", "Queen Street", 4000),
        ("WA", "Perth", "Hay Street", 6000),
        ("SA", "Adelaide", "King William Road", 5000),
        ("TAS", "Hobart", "Elizabeth Street", 7000),
    )
    return [
        Address(
            user_id=user.id,
            country_code="AU",
            state=state,
            city=city,
            street=f"{index + 1} {street}",
            postcode=postcode + index % 9,
        )
        for index, user in enumerate(users)
        for state, city, street, postcode in [
            address_data[index % len(address_data)]
        ]
    ]


def _make_products() -> list[Product]:
    products = []
    base_products = _product_data()
    variant_names = ("", "Reserve", "Deluxe", "Masterwork")
    for index in range(200):
        data = base_products[index % len(base_products)]
        variant = variant_names[index // len(base_products)]
        name = str(data["name"])
        if variant:
            name = f"{variant} {name}"
        products.append(
            Product(
                name=name,
                category=data["category"],
                rarity=data["rarity"],
                price_aud_cent=int(data["price"]) + (index // 50) * 750,
                slug=name.lower().replace(" ", "-").replace("'", ""),
                description=data["description"],
                created_at=SEED_DATE.date()
                - timedelta(days=(index * 7) % HISTORY_DAYS),
                units_sold=(index * 137) % 5000,
            )
        )
    return products


def _make_stocks(products: list[Product]) -> list[Stock]:
    return [
        Stock(
            product_id=product.id,
            current=(index * 17) % 125,
            updated_at=SEED_DATE.date() - timedelta(days=index % 14),
        )
        for index, product in enumerate(products)
    ]


def _make_sales(products: list[Product]) -> list[Sale]:
    sale_names = (
        "Founder's Collection",
        "Spring Sale",
        "Guild Clearance",
        "Arcane Discovery",
        "Summer Expedition",
        "Harvest Market",
        "Winter Wardrobe",
        "New Year Relics",
        "Ranger's Choice",
        "Hall of Legends",
    )
    sales = []
    for index, name in enumerate(sale_names):
        start = SEED_DATE.date() - timedelta(days=HISTORY_DAYS - index * 90)
        end = start + timedelta(days=45 + index * 8)
        sales.append(
            Sale(
                discount_percent=10 + (index % 5) * 5,
                start_at=start,
                end_at=end,
                name=name,
                slug=name.lower().replace(" ", "-").replace("'", ""),
                description=(
                    f"Seasonal offers on {name.lower()} treasures and equipment."
                ),
                products=products[index * 15 : index * 15 + 35],
            )
        )
    return sales


def _make_reviews(
    users: list[User], products: list[Product]
) -> list[Review]:
    comments = (
        "Excellent quality and exactly as described.",
        "A reliable addition to my adventuring kit.",
        "The craftsmanship is even better in person.",
        "Arrived promptly and has performed beautifully.",
        "Good value, with a thoughtful and practical design.",
        "The item has become a favourite part of my collection.",
        "The finish is impressive and the description was accurate.",
    )
    return [
        Review(
            user_id=users[(index * 7 + 1) % len(users)].id,
            product_id=products[(index * 11) % len(products)].id,
            created_at=SEED_DATE.date()
            - timedelta(days=(index * 13) % HISTORY_DAYS),
            rating=(index % 5) + 1,
            description=comments[index % len(comments)],
        )
        for index in range(300)
    ]


def _make_orders(
    users: list[User], addresses: list[Address], products: list[Product]
) -> list[Order]:
    orders = []
    for index in range(400):
        created_at = SEED_DATE - timedelta(
            days=HISTORY_DAYS - 1 - (index * 3) % HISTORY_DAYS,
            hours=index % 12,
        )
        product = products[(index * 3) % len(products)]
        quantity = index % 3 + 1
        cost = product.price_aud_cent * quantity
        if index % 5 == 0:
            cost += products[(index * 3 + 1) % len(products)].price_aud_cent
        orders.append(
            Order(
                user_id=users[(index * 7 + 1) % len(users)].id,
                address_id=addresses[(index * 7 + 1) % len(addresses)].id,
                status=ORDER_STATUSES[index % len(ORDER_STATUSES)],
                created_at=created_at,
                updated_at=created_at + timedelta(hours=2),
                cost_aud_cent=cost,
                sent_at=(
                    created_at + timedelta(days=2)
                    if index % len(ORDER_STATUSES) in (2, 3)
                    else None
                ),
                delivery_note=(
                    "Leave at reception if nobody answers."
                    if index % 3 == 0
                    else None
                ),
            )
        )
    return orders


def _make_order_products(
    orders: list[Order], products: list[Product], sales: list[Sale]
) -> list[OrderProduct]:
    order_products = []
    for index, order in enumerate(orders):
        product = products[(index * 3) % len(products)]
        quantity = index % 3 + 1
        order_products.append(
            OrderProduct(
                order_id=order.id,
                product_id=product.id,
                sale_id=sales[index % len(sales)].id if index % 2 == 0 else None,
                quantity=quantity,
                unit_price_aud_cent=product.price_aud_cent,
            )
        )
        if index % 5 == 0:
            second_product = products[(index * 3 + 1) % len(products)]
            order_products.append(
                OrderProduct(
                    order_id=order.id,
                    product_id=second_product.id,
                    quantity=1,
                    unit_price_aud_cent=second_product.price_aud_cent,
                )
            )
    return order_products


def _make_payments(orders: list[Order]) -> list[Payment]:
    payment_statuses = (
        "succeeded",
        "succeeded",
        "processing",
        "refunded",
        "failed",
        "pending",
    )
    payments = [
        Payment(
            amount_cent=order.cost_aud_cent,
            reference=f"PAY-{index + 1:05d}",
            provider="stripe" if index % 2 == 0 else "paypal",
            currency_code=36,
            status=payment_statuses[index % len(payment_statuses)],
            created_at=order.created_at,
            updated_at=order.updated_at,
            order_id=order.id,
            user_id=order.user_id,
        )
        for index, order in enumerate(orders)
    ]
    return payments


def production_seed(session) -> None:
    users = _make_users()
    session.add_all(users)
    session.flush()

    addresses = _make_addresses(users)
    session.add_all(addresses)
    session.flush()

    products = _make_products()
    session.add_all(products)
    session.flush()

    stocks = _make_stocks(products)
    session.add_all(stocks)
    session.flush()

    sales = _make_sales(products)
    session.add_all(sales)
    session.flush()

    reviews = _make_reviews(users, products)
    session.add_all(reviews)
    session.flush()

    orders = _make_orders(users, addresses, products)
    session.add_all(orders)
    session.flush()

    order_products = _make_order_products(orders, products, sales)
    session.add_all(order_products)
    session.flush()

    payments = _make_payments(orders)
    session.add_all(payments)
    session.commit()
