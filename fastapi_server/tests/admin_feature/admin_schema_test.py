from app.features.admin.admin_schema import (
    OrderStatus,
    OrderSummary,
    PerformanceAnalytics,
    SaleAnalytics,
    UserSummary,
)


class UserSummary_test:
    def from_user_test(self, user):
        result = UserSummary.from_User(user)

        assert result.id == user.id
        assert result.name == user.name
        assert result.email == user.email


class OrderSummary_test:
    def from_order_test(self, admin_status_seed, order_factory):
        order = order_factory()
        result = OrderSummary.from_Order(order)

        assert result.order_id == order.id
        assert result.total_cent == order.cost_aud_cent
        assert result.status == OrderStatus.pending


class SaleAnalytics_test:
    def from_sale_test(self, sale):
        result = SaleAnalytics.from_query((sale, None, None, None))

        assert result.id == sale.id
        assert result.revenue == 0
        assert result.order_count == 0
        assert result.revenue_lost == 0


class PerformanceAnalytics_test:
    def from_query_test(self):
        result = PerformanceAnalytics.from_query(
            30,
            (100, 2, 1, 10),
            (50, 1, 0, 5),
        )

        assert result.period_days == 30
        assert result.revenue == 100
        assert result.previous_orders == 1
