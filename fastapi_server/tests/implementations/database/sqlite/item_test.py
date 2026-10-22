import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.item.schema import ItemSummary
from tests.implementations.database.sqlite.fixtures import (
    product_model_factory,
    sale_model_factory,
    user_model_factory,
    order_model_factory,
    item_model_factory,
)


@pytest.mark.medium
class SqliteItemResolve_test:
    def functionality_test(self, session_database, sqlite_session):
        user = user_model_factory()
        product = product_model_factory(stock=8)
        order = order_model_factory()
        sqlite_session.add_all([user, product, order])
        sqlite_session.commit()

        result, total = session_database.item.resolve(
            [ItemSummary(product_id=1, quantity=2)]
        )

        assert len(result) == 1
        assert result[0].product.id == 1
        assert result[0].unit_price_cent == 2500
        assert result[0].line_total_cent == 5000
        assert result[0].warning is None
        assert total == 5000

    def applies_the_best_active_sale_test(
        self,
        session_database,
        sqlite_session,
    ):
        product = product_model_factory(price_aud_cent=1000)
        sale = sale_model_factory(discount_perc=25)
        product.sales.append(sale)
        sqlite_session.add(product)
        sqlite_session.commit()

        result, total = session_database.item.resolve(
            [ItemSummary(product_id=1, quantity=2)]
        )

        assert result[0].on_sale is True
        assert result[0].unit_price_cent == 750
        assert total == 1500

    def returns_warnings_for_stock_and_discontinued_products_test(
        self,
        session_database,
        sqlite_session,
    ):
        out_of_stock = product_model_factory(
            product_id=1,
            slug="out-of-stock",
            stock=0,
        )
        discontinued = product_model_factory(
            product_id=2,
            slug="discontinued",
            discontinued_at=out_of_stock.created_at,
        )
        sqlite_session.add_all([out_of_stock, discontinued])
        sqlite_session.commit()

        result, _ = session_database.item.resolve(
            [
                ItemSummary(product_id=1, quantity=1),
                ItemSummary(product_id=2, quantity=1),
            ]
        )

        assert result[0].warning == "Product is out of stock"
        assert result[1].warning == "Product is discontinued"

    def returns_empty_for_empty_items_test(self, session_database):
        assert session_database.item.resolve([]) == ([], 0)

    def rejects_invalid_quantities_test(self, session_database):
        with pytest.raises(
            ValueError,
            match="greater than zero",
        ):
            session_database.item.resolve(
                [ItemSummary(product_id=1, quantity=0)]
            )

    def raises_for_missing_products_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="Product Not Found",
        ) as error:
            session_database.item.resolve(
                [ItemSummary(product_id=99, quantity=1)]
            )

        assert error.value.details == {"product_id": 99}
