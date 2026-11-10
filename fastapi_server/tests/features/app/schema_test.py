import pytest
from pydantic import ValidationError

from app.features.app.schema import (
    Attention,
    Graph,
    GraphPoint,
    Performance,
    Stats,
)
from tests.features.app.fixtures import (
    attention_factory,
    graph_factory,
    graph_point_factory,
    performance_factory,
    stats_factory,
)


@pytest.mark.low
class StatsSchema_test:
    def functionality_test(self):
        stats = stats_factory()

        assert stats.product_count == 24
        assert stats.customer_count == 18
        assert stats.total_average_rating == 4.25

    def requires_all_statistics_test(self):
        with pytest.raises(ValidationError):
            Stats.model_validate({})


@pytest.mark.low
class AttentionSchema_test:
    def functionality_test(self):
        attention = attention_factory()

        assert attention.pending_orders == 5
        assert attention.out_of_stock_products == 3
        assert attention.sales_ending == 2

    def rejects_missing_attention_values_test(self):
        with pytest.raises(ValidationError):
            Attention.model_validate({})


@pytest.mark.low
class PerformanceSchema_test:
    def functionality_test(self):
        performance = performance_factory()

        assert performance.period_days == 30
        assert performance.revenue == 50000
        assert performance.previous_orders == 21

    def requires_performance_values_test(self):
        with pytest.raises(ValidationError):
            Performance.model_validate({})


@pytest.mark.low
class GraphPointSchema_test:
    def functionality_test(self):
        point = graph_point_factory()

        assert point.month == "2026-01"
        assert point.revenue == 12000
        assert point.orders == 6

    def requires_graph_point_values_test(self):
        with pytest.raises(ValidationError):
            GraphPoint.model_validate({})


@pytest.mark.low
class GraphSchema_test:
    def functionality_test(self):
        graph = graph_factory()

        assert len(graph.points) == 2
        assert graph.points[0].month == "2026-01"
        assert graph.points[1].revenue == 15000

    def permits_empty_graph_test(self):
        graph = Graph(points=[])

        assert graph.points == []
