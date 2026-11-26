from datetime import date, timedelta

import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.item.schema import ItemResolution
from app.features.order.schema import Address
from app.features.product.schema import ProductSummary
from tests.implementations.database.sqlite.fixtures import (
    item_model_factory,
    order_model_factory,
    product_model_factory,
    user_model_factory,
)


def order_item_resolution_factory(
    product_id: int = 1,
    sale_id: int | None = None,
    quantity: int = 2,
    unit_price_cent: int = 2500,
) -> ItemResolution:
    return ItemResolution(
        product=ProductSummary(
            id=product_id,
            sale_id=sale_id,
            name="Battle Axe",
            slug="battle-axe",
        ),
        quantity=quantity,
        unit_price_cent=unit_price_cent,
        line_total_cent=quantity * unit_price_cent,
        on_sale=sale_id is not None,
        warning=None,
    )


@pytest.mark.medium
class SqliteOrderGet_test:
    def functionality_test(self, session_database, sqlite_session):
        user = user_model_factory()
        product = product_model_factory()
        order = order_model_factory(status="delivered")
        order.items = [item_model_factory()]
        sqlite_session.add_all([user, product, order])
        sqlite_session.commit()

        result = session_database.order.get(1)

        assert result.user_id == 1
        assert result.status.value == "delivered"
        assert result.address_string == (
            "1 Test Street, Melbourne, VIC, 3000, AU"
        )
        assert result.items[0].line_total_cent == 4000

    def filters_orders_by_user_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                user_model_factory(
                    user_id=2,
                    email="other@example.com",
                ),
                order_model_factory(order_id=1, user_id=1),
                order_model_factory(
                    order_id=2,
                    user_id=2,
                    address_id=2,
                ),
            ]
        )
        sqlite_session.commit()

        assert [
            order.id
            for order in session_database.order.get_all(user_id=2)
        ] == [2]


@pytest.mark.medium
class SqliteOrderCreateWithItems_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
            ]
        )
        sqlite_session.commit()

        result = session_database.order.create_with_items(
            user_id=1,
            address=Address(
                country_code="AU",
                postcode="3000",
                state="VIC",
                city="Melbourne",
                street="2 New Street",
            ),
            items=[order_item_resolution_factory()],
            status="pending",
            cost_aud_cent=5000,
            delivery_note="Leave at door",
        )

        assert result.id == 1
        assert result.items[0].quantity == 2
        assert result.address_string.startswith("2 New Street")

    def raises_for_missing_user_test(self, session_database):
        with pytest.raises(
            ContentNotFoundException,
            match="User Not Found",
        ):
            session_database.order.create_with_items(
                user_id=99,
                address=Address(
                    country_code="AU",
                    postcode="3000",
                    state="VIC",
                    city="Melbourne",
                    street="2 New Street",
                ),
                items=[],
                status="pending",
                cost_aud_cent=0,
                delivery_note=None,
            )


@pytest.mark.medium
class SqliteOrderStatus_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                order_model_factory(),
            ]
        )
        sqlite_session.commit()

        session_database.order.patch_status(1, "shipped")

        assert sqlite_session.get(
            type(order_model_factory()),
            1,
        ).status == "shipped"
        assert session_database.order.count_by_status("shipped") == 1

    def patches_many_and_reports_missing_ids_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                order_model_factory(order_id=1),
                order_model_factory(order_id=2, address_id=2),
            ]
        )
        sqlite_session.commit()

        session_database.order.patch_statuses([1, 2], "cancelled")
        assert session_database.order.count_by_status("cancelled") == 2

        with pytest.raises(
            ContentNotFoundException,
            match="Order Not Found",
        ) as error:
            session_database.order.patch_statuses([1, 3], "error")

        assert error.value.details == {"order_ids": [3]}


@pytest.mark.medium
class SqliteOrderSearchAndMetrics_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                order_model_factory(
                    status="delivered",
                    cost_aud_cent=1000,
                ),
                order_model_factory(
                    order_id=2,
                    address_id=2,
                    status="cancelled",
                    cost_aud_cent=500,
                ),
            ]
        )
        sqlite_session.commit()

        summaries, has_more = session_database.order.search_admin(
            search_name="Test User",
            statuses=["delivered"],
            sort_by="cost",
            is_ascending=True,
            limit=10,
            offset=0,
        )
        performance = session_database.order.get_performance(7)

        assert [summary.id for summary in summaries] == [1]
        assert has_more is False
        assert performance.revenue == 1000
        assert performance.orders == 1
        assert performance.revenue_lost == 500

    def returns_monthly_graph_points_test(
        self,
        session_database,
    ):
        points = session_database.order.get_graph(2)

        assert len(points) == 2
        assert points[0].month < points[1].month

    @pytest.mark.parametrize(
        "method_name",
        ["get_recent", "get_performance", "get_graph"],
    )
    def rejects_negative_ranges_test(
        self,
        session_database,
        method_name,
    ):
        with pytest.raises(ValueError, match="non-negative"):
            getattr(session_database.order, method_name)(-1)
