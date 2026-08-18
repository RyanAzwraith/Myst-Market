import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.admin.admin_orders_service import (
    get_order_user,
    patch_order_status,
    patch_orders_status,
    search_orders,
)
from app.features.admin.admin_schema import (
    OrderSortBy,
    OrderStatus,
    PatchOrderBulkRequest,
    PatchOrderStatusRequest,
    PostOrdersSearchRequest,
)


class get_order_user_test:
    def functionality_test(
        self,
        session,
        user,
        address,
        product,
        admin_status_seed,
        order_factory,
    ):
        order = order_factory()
        result = get_order_user(session, order.id)

        assert result.user.id == user.id
        assert result.user.name == user.name
        assert result.user.email == user.email
        assert result.order.user_id == user.id
        assert result.order.address_string == (
            f"{address.street}, {address.city}, {address.state}, "
            f"{address.postcode}, {address.country_code}"
        )
        assert result.order.cost_aud_cent == order.cost_aud_cent
        assert result.order.created_at == order.created_at
        assert result.order.status == OrderStatus.pending
        assert len(result.order.item_resolutions) == 1

        item = result.order.item_resolutions[0]
        assert item.product_summary.id == product.id
        assert item.product_summary.name == product.name
        assert item.quantity == order.order_products[0].quantity
        assert item.unit_price_cent == product.price_aud_cent
        assert item.line_total_cent == (item.quantity * item.unit_price_cent)
        assert not item.on_sale

    def missing_order_test(self, session):
        with pytest.raises(ContentNotFoundException):
            get_order_user(session, 500)


class search_orders_test:
    def functionality_test(
        self,
        session,
        user,
        admin_status_seed,
        order_factory,
    ):
        order = order_factory()
        result = search_orders(session, PostOrdersSearchRequest())

        assert len(result.orders) == 1
        assert result.orders[0].order_id == order.id
        assert result.orders[0].status == OrderStatus.pending

    def name_filter_test(
        self,
        session,
        user,
        admin_status_seed,
        order_factory,
    ):
        order_factory()
        result = search_orders(
            session,
            PostOrdersSearchRequest(search_name=user.name),
        )

        assert len(result.orders) == 1

    def status_filter_test(self, session, admin_status_seed, order_factory):
        order_factory()
        result = search_orders(
            session,
            PostOrdersSearchRequest(status=[OrderStatus.pending]),
        )

        assert len(result.orders) == 1

    def sorting_test(self, session, admin_status_seed, order_factory):
        first = order_factory()
        second = order_factory()
        second.cost_aud_cent = first.cost_aud_cent + 100
        session.commit()

        result = search_orders(
            session,
            PostOrdersSearchRequest(
                sort_by=OrderSortBy.cost,
                is_ascending=False,
            ),
        )

        assert result.orders[0].order_id == second.id

    def pagination_test(self, session, admin_status_seed, order_factory):
        order_factory()
        order_factory()
        result = search_orders(
            session,
            PostOrdersSearchRequest(limit=1),
        )

        assert len(result.orders) == 1
        assert result.has_more


class patch_order_status_test:
    def functionality_test(self, session, admin_status_seed, order_factory):
        order = order_factory()
        patch_order_status(
            session,
            order.id,
            PatchOrderStatusRequest(status=OrderStatus.shipped),
        )
        session.refresh(order)

        assert order.status.name == OrderStatus.shipped.value

    def missing_order_test(self, session):
        with pytest.raises(ContentNotFoundException):
            patch_order_status(
                session,
                500,
                PatchOrderStatusRequest(status=OrderStatus.shipped),
            )


class patch_orders_status_test:
    def functionality_test(self, session, admin_status_seed, order_factory):
        first = order_factory()
        second = order_factory()
        request = PatchOrderBulkRequest(
            order_ids=[first.id, second.id],
            status=OrderStatus.delivered,
        )

        patch_orders_status(session, request)
        session.refresh(first)
        session.refresh(second)

        assert first.status.name == OrderStatus.delivered.value
        assert second.status.name == OrderStatus.delivered.value

    def missing_order_test(self, session, admin_status_seed, order_factory):
        order = order_factory()
        request = PatchOrderBulkRequest(
            order_ids=[order.id, 500],
            status=OrderStatus.delivered,
        )

        with pytest.raises(ContentNotFoundException):
            patch_orders_status(session, request)
