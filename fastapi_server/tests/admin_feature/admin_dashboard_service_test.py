from app.features.admin.admin_dashboard_service import (
    get_attention,
    get_graph,
    get_performance,
)


class get_performance_test:
    def empty_database_test(self, session):
        result = get_performance(session)

        assert result.period_days == 30
        assert result.revenue == 0
        assert result.orders == 0
        assert result.previous_revenue == 0

    def functionality_test(self, session, admin_status_seed, order_factory):
        order_factory()
        result = get_performance(session)

        assert result.orders == 1
        assert result.revenue > 0


class get_attention_test:
    def functionality_test(self, session, admin_status_seed, order_factory):
        order_factory()
        result = get_attention(session)

        assert result.pending_orders == 1

    def no_attention_test(self, session):
        result = get_attention(session)

        assert result.pending_orders == 0
        assert result.out_of_stock_products == 0
        assert result.sales_ending == 0


class get_graph_test:
    def functionality_test(self, session):
        result = get_graph(session)

        assert len(result.points) == 12
        assert result.points[0].month < result.points[-1].month
