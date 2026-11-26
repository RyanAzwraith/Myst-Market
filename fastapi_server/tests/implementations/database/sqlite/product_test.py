from datetime import date, timedelta

import pytest

from app.core.exceptions import ConflictException, ContentNotFoundException
from tests.implementations.database.sqlite.fixtures import (
    product_model_factory,
    sale_model_factory,
)


@pytest.mark.medium
class SqliteProductGet_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add(product_model_factory())
        sqlite_session.commit()

        result = session_database.product.get_by_slug("battle-axe")

        assert result.id == 1
        assert result.price_aud_cent == 2500
        assert result.discounted_price == 2500
        assert result.sale is None

    def includes_the_best_active_sale_test(
        self,
        session_database,
        sqlite_session,
    ):
        product = product_model_factory(price_aud_cent=2000)
        product.sales.append(
            sale_model_factory(discount_perc=25),
        )
        sqlite_session.add(product)
        sqlite_session.commit()

        result = session_database.product.get_by_slug("battle-axe")

        assert result.discounted_price == 1500
        assert result.sale.slug == "summer-sale"

    def raises_for_missing_slug_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="Product Not Found",
        ):
            session_database.product.get_by_slug("missing")


@pytest.mark.medium
class SqliteProductCreate_test:
    def functionality_test(self, session_database):
        result = session_database.product.create(
            name="New Product",
            category="potions",
            rarity="common",
            price_aud_cent=900,
            slug="new-product",
            description=None,
            stock=5,
        )

        assert result.name == "New Product"
        assert result.stock == 5
        assert result.description == ""

    def rejects_duplicate_slugs_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add(product_model_factory())
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="slug already exists",
        ):
            session_database.product.create(
                name="Other",
                category="potions",
                rarity="common",
                price_aud_cent=100,
                slug="battle-axe",
                description=None,
                stock=1,
            )


@pytest.mark.medium
class SqliteProductSearch_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                product_model_factory(
                    product_id=1,
                    name="Axe",
                    slug="axe",
                    stock=5,
                    units_sold=20,
                ),
                product_model_factory(
                    product_id=2,
                    name="Bow",
                    slug="bow",
                    stock=0,
                    units_sold=30,
                ),
                product_model_factory(
                    product_id=3,
                    name="Discontinued Axe",
                    slug="old-axe",
                    discontinued_at=date.today(),
                ),
            ]
        )
        sqlite_session.commit()

        result, has_more = session_database.product.search(
            search="axe",
            sort="alphabet",
            is_ascending=True,
            limit=10,
        )

        assert [product.slug for product in result] == ["axe"]
        assert has_more is False

    def rejects_unknown_sort_test(self, session_database):
        with pytest.raises(
            ValueError,
            match="Unsupported product sort",
        ):
            session_database.product.search(
                search=None,
                sort="unknown",
                is_ascending=None,
            )


@pytest.mark.medium
class SqliteProductPatchAndCounts_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add(
            product_model_factory(stock=2),
        )
        sqlite_session.commit()

        result = session_database.product.patch(
            1,
            name="Updated Axe",
            stock=7,
        )

        assert result.name == "Updated Axe"
        assert result.stock == 7

    def counts_and_discontinues_products_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                product_model_factory(product_id=1, stock=0),
                product_model_factory(
                    product_id=2,
                    slug="discontinued",
                    discontinued_at=date.today(),
                ),
            ]
        )
        sqlite_session.commit()

        assert session_database.product.count() == 1
        assert session_database.product.count(True) == 2
        assert session_database.product.count_out_of_stock() == 1

        session_database.product.delete(1)

        assert session_database.product.count() == 0
