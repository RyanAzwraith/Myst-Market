from datetime import datetime, timedelta
from random import choice, randint, sample

from faker import Faker

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

fake = Faker()


def seed(db, num_users=1000, num_products=5000):
    users = []

    for _ in range(num_users):
        users.append(
            User(
                email=fake.unique.email(),
                name=fake.name(),
                is_admin=False,
                is_registered=True,
                password_hash="fake_hash",
            )
        )

    db.add_all(users)
    db.flush()

    addresses = []

    for user in users:
        addresses.append(
            Address(
                user_id=user.id,
                country_code="AU",
                state=fake.state_abbr(),
                city=fake.city(),
                street=fake.street_address(),
                postcode=randint(1000, 9999),
            )
        )
        if randint(1, 10) <= 2:
            addresses.append(
                Address(
                    user_id=user.id,
                    country_code="AU",
                    state=fake.state_abbr(),
                    city=fake.city(),
                    street=fake.street_address(),
                    postcode=randint(1000, 9999),
                )
            )

    db.add_all(addresses)
    db.flush()

    product_objects = []

    for i in range(1, num_products + 1):
        product_objects.append(
            Product(
                name=fake.catch_phrase(),
                category_id=randint(1, 4),
                rarity_id=randint(1, 5),
                price_aud_cent=randint(100, 50000),
                slug=f"product-{i}",
                description=fake.paragraph(),
            )
        )

    db.add_all(product_objects)
    db.flush()

    stock_objects = []

    for product in product_objects:
        stock_objects.append(
            Stock(
                product_id=product.id,
                current=randint(0, 500),
                updated_at=datetime.now(),
            )
        )

    db.add_all(stock_objects)
    db.flush()

    sales = []

    for _ in range(10):
        sale_products = sample(product_objects, k=min(20, len(product_objects)))
        sales.append(
            Sale(
                discount_percent=randint(10, 50),
                start_at=datetime.now() - timedelta(days=randint(1, 7)),
                end_at=datetime.now() + timedelta(days=randint(7, 30)),
                name=fake.catch_phrase(),
                description=fake.sentence(),
                products=sale_products,
            )
        )

    db.add_all(sales)
    db.flush()

    review_objects = []
    num_reviews = min(num_products * 2, 5000)

    for _ in range(num_reviews):
        review_objects.append(
            Review(
                user_id=choice(users).id,
                product_id=choice(product_objects).id,
                rating=randint(1, 5),
                description=fake.sentence(),
            )
        )

    db.add_all(review_objects)
    db.flush()

    order_product_objects = []
    payment_objects = []

    for _ in range(min(num_users, 500)):
        user = choice(users)
        user_addresses = [
            address for address in addresses if address.user_id == user.id
        ]
        if not user_addresses:
            continue

        selected_products = sample(product_objects, k=randint(1, 3))
        total_cost = sum(
            product.price_aud_cent * randint(1, 3) for product in selected_products
        )

        order = Order(
            user_id=user.id,
            status_id=randint(1, 6),
            address_id=choice(user_addresses).id,
            cost_aud_cent=total_cost,
            delivery_note=fake.sentence(),
        )

        db.add(order)
        db.flush()

        for product in selected_products:
            order_product_objects.append(
                OrderProduct(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=randint(1, 3),
                    unit_price_aud_cent=product.price_aud_cent,
                )
            )

        payment_objects.append(
            Payment(
                amount_cent=total_cost,
                reference=f"PAY-{fake.unique.pyint(100000, 999999)}",
                provider=choice(["stripe", "paypal"]),
                currency_code=36,
                status=choice(["completed", "pending", "failed"]),
                created_at=fake.date_time_between(start_date='-2y', end_date='now'),
                updated_at=datetime.now(),
                order_id=order.id,
                user_id=user.id,
            )
        )

    db.add_all(order_product_objects)
    db.add_all(payment_objects)
    db.flush()

    media_objects = []

    for i in range(50):
        product = choice(product_objects)
        media_objects.append(
            Media(
                type="image",
                file_name=f"product-{product.id}-{i}.png",
                created_at=fake.date_time_between(start_date='-2y', end_date='now'),
                alt_text=product.name,
                sort_order=i,
            )
        )

    db.add_all(media_objects)
    db.flush()

    media_entity_objects = []

    for media in media_objects:
        media_entity_objects.append(
            MediaEntity(
                entity_type="product",
                entity_id=choice(product_objects).id,
                media_id=media.id,
            )
        )

    db.add_all(media_entity_objects)
    db.flush()

    article_objects = []

    for i in range(25):
        article_products = sample(product_objects, k=min(3, len(product_objects)))
        article_objects.append(
            Article(
                created_at=fake.date_time_between(start_date='-2y', end_date='now'),
                slug=f"article-{i + 1}",
                title=fake.sentence(nb_words=5),
                desciption=fake.paragraph(),
                products=article_products,
            )
        )

    db.add_all(article_objects)
    db.flush()
    db.commit()
