import pytest
from datetime import datetime, timedelta

from app.db.models import (
    Product,
)

from app.features.catalogue.catalogue_service import (
    get_stats,
    get_featured_product,
    get_popular_products,
    get_newest_products,
    get_testimonials,
    get_biggest_sales,
)


class get_stats_test:
    def functionality_test(
        _, session, shop_seed, user_seed, order_seed, review_seed
    ):
        result = get_stats(session)

        assert result.product_count == session.query(Product).count()
        assert result.customer_count == 2
        assert result.total_average_rating > 0

    def no_reviews_test(
        _, session, shop_seed, user_seed, order_seed
    ):
        result = get_stats(session)

        assert result.total_average_rating == 0

    def excludes_users_without_orders_test(
        _, session, shop_seed, user_seed, order_seed, review_seed
    ):
        result = get_stats(session)

        assert result.customer_count == 2


class get_featured_product_test:
    def functionality_test(
        _, session, shop_seed, review_factory, user_list_factory
    ):
        product = shop_seed["products"][2]

        for user in  user_list_factory(4):
            review_factory(
                user_id=user.id,
                product_id=product.id,
                rating=5,
                description="this is definitely a long enough review",
            )

        result = get_featured_product(session)
        assert result.id == product.id


    def falls_back_to_newest_product_if_no_featured_product_test(
        _, session, shop_seed, product
    ):
        result = get_featured_product(session)

        assert result.id == product.id

    def requires_active_sale_test(
        _, session, shop_seed, review_factory, user_list_factory
    ):
        pass

    def requires_more_than_three_reviews_test(
        _, session, shop_seed, review_factory, user_list_factory
    ):
        product = shop_seed["products"][2]

        for user in user_list_factory(3):
            review_factory(
                user_id=user.id,
                product_id=product.id,
                rating=5,
                description="this is definitely a long enough review",
            )

        result = get_featured_product(session)

        assert result.id != product.id


class get_popular_products_test:
    def functionality_test(
        _, session, shop_seed, order_seed
    ):
        limit = 5
        result = list(get_popular_products(session, limit=limit))
        assert len(result) == limit

class get_newest_products_test:
    def functionality_test(
        _, session, shop_seed
    ):
        limit = 5
        result = list(get_newest_products(session, limit=limit))
        assert len(result) == limit

class get_testimonials_test:
    def functionality_test(
        _, session, review_factory
    ):
        review_factory(
            rating=5,
            description="this is definitely a long enough review",
        )

        result = list(get_testimonials(session, limit=10))

        assert len(result) == 1

    def excludes_short_reviews_test(
        _, session, review_factory
    ):
        review_factory(
            rating=5,
            description="too short",
        )

        result = list(get_testimonials(session, limit=10))

        assert len(result) == 0

    def excludes_non_five_star_reviews_test(
        _, session, review_factory
    ):
        review_factory(
            rating=4,
            description="this is definitely a long enough review",
        )

        result = list(get_testimonials(session, limit=10))

        assert len(result) == 0

    def respects_limit_test(
        _, session, review_factory, user_list_factory
    ):
        for user in  user_list_factory(5):
            review_factory(
                user_id=user.id,
                rating=5,
                description="this is definitely a long enough review",
            )

        result = list(get_testimonials(session, limit=2))

        assert len(result) == 2


class get_biggest_sales_test:
    def functionality_test(
        _, session, sale
    ):
        limit = 2
        result = get_biggest_sales(session, limit=limit)
        assert len(result) > 0

    def excludes_inactive_sales_test(
        _, session
    ):
        pass

    def sorts_by_discount_percent_test(
        _, session, sale
    ):
        result = list(get_biggest_sales(session, limit=10))

        discounts = [o.discount_percent for o in result]
        assert discounts == sorted(discounts, reverse=True)
