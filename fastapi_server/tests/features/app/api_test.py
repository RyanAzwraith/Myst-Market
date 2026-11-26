import pytest

from tests.features.app.fixtures import (
    attention_factory,
    graph_point_factory,
    performance_factory,
    stats_factory,
)


@pytest.mark.medium
class GetStatsHandler_test:
    def functionality_test(self, app_feature_client, database):
        database.product.count.return_value = 24
        database.user.count_customers.return_value = 18
        database.review.get_average_rating.return_value = 4.25

        response = app_feature_client.get("/stats")

        assert response.status_code == 200
        assert response.json() == {
            "stats": stats_factory().model_dump(by_alias=True),
        }
        database.product.count.assert_called_once_with()
        database.user.count_customers.assert_called_once_with()
        database.review.get_average_rating.assert_called_once_with()

    def returns_zero_and_empty_statistics_test(
        self,
        app_feature_client,
        database,
    ):
        database.product.count.return_value = 0
        database.user.count_customers.return_value = 0
        database.review.get_average_rating.return_value = 0.0

        response = app_feature_client.get("/stats")

        assert response.status_code == 200
        assert response.json()["stats"] == {
            "productCount": 0,
            "customerCount": 0,
            "totalAverageRating": 0.0,
        }


@pytest.mark.high
class GetAttentionHandler_test:
    def functionality_test(self, app_feature_client, database):
        attention = attention_factory()
        database.order.count_by_status.return_value = (
            attention.pending_orders
        )
        database.product.count_out_of_stock.return_value = (
            attention.out_of_stock_products
        )
        database.sale.count_ending_within.return_value = (
            attention.sales_ending
        )

        response = app_feature_client.get("/attention")

        assert response.status_code == 200
        assert response.json() == {
            "attention": attention.model_dump(by_alias=True),
        }
        database.order.count_by_status.assert_called_once_with("pending")
        database.product.count_out_of_stock.assert_called_once_with()
        database.sale.count_ending_within.assert_called_once_with(7)


@pytest.mark.high
class GetGraphHandler_test:
    def functionality_test(self, app_feature_client, database):
        points = [
            graph_point_factory(),
            graph_point_factory(
                month="2026-02",
                revenue=15000,
                orders=8,
            ),
        ]
        database.order.get_graph.return_value = points

        response = app_feature_client.get("/graph")

        assert response.status_code == 200
        assert response.json() == {
            "graphPoints": [
                point.model_dump(by_alias=True)
                for point in points
            ],
        }
        database.order.get_graph.assert_called_once_with(12)

    def returns_empty_graph_test(self, app_feature_client, database):
        database.order.get_graph.return_value = []

        response = app_feature_client.get("/graph")

        assert response.status_code == 200
        assert response.json() == {"graphPoints": []}


@pytest.mark.high
class RetrievePerformanceHandler_test:
    def functionality_test(self, app_feature_client, database):
        performance = performance_factory(period_days=30)
        database.order.get_performance.return_value = performance

        response = app_feature_client.post(
            "/performance",
            json={"period": 30},
        )

        assert response.status_code == 200
        assert response.json() == {
            "performance": performance.model_dump(by_alias=True),
        }
        database.order.get_performance.assert_called_once_with(30)

    def rejects_missing_period_test(
        self,
        app_feature_client,
        database,
    ):
        response = app_feature_client.post(
            "/performance",
            json={},
        )

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"
        database.order.get_performance.assert_not_called()
