from app.db.models import (
    Category,
    Rarity,
    Status,
)

def base_seed(session):
    categories = [
        Category(name="Artifacts"),
        Category(name="Consumables"),
        Category(name="Weapons"),
        Category(name="Accessories"),
    ]

    rarities = [
        Rarity(name="Common", order=5),
        Rarity(name="Uncommon", order=4),
        Rarity(name="Rare", order=3),
        Rarity(name="Epic", order=2),
        Rarity(name="Legendary", order=1),
    ]

    statuses = [
        Status(name="Pending"),
        Status(name="Processing"),
        Status(name="Shipped"),
        Status(name="Delivered"),
        Status(name="Cancelled"),
        Status(name="Error"),
    ]

    session.add_all(categories)
    session.add_all(rarities)
    session.add_all(statuses)

    session.commit()
