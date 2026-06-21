from app.db.models import *

def base_seed(db):
    categories = [
        Category(name="Artifacts"),
        Category(name="Consumables"),
        Category(name="Weapons"),
        Category(name="Accessories"),
    ]

    rarities = [
        Rarity(name="Common"),
        Rarity(name="Uncommon"),
        Rarity(name="Rare"),
        Rarity(name="Epic"),
        Rarity(name="Legendary"),
    ]

    statuses = [
        Status(name="Pending"),
        Status(name="Processing"),
        Status(name="Shipped"),
        Status(name="Delivered"),
        Status(name="Cancelled"),
        Status(name="Error"),
    ]

    db.add_all(categories)
    db.add_all(rarities)
    db.add_all(statuses)

    db.commit()
