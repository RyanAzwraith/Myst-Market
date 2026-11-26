import pytest
from pydantic import ValidationError

from app.features.sale.schema import (
    Activation,
    AdminSort,
    AdminSearchParams,
    SaleInput,
)
from tests.features.sale.fixtures import (
    admin_search_params_factory,
    sale_analytics_factory,
    sale_factory,
    sale_input_factory,
)


@pytest.mark.low
class SaleSchema_test:
    def functionality_test(self):
        sale = sale_factory()

        assert sale.id == 4
        assert sale.slug == "summer-sale"
        assert sale.discount_perc == 20

    def preserves_sale_dates_test(self):
        sale = sale_factory()

        assert sale.start_at.isoformat() == "2026-06-01"
        assert sale.end_at.isoformat() == "2026-06-30"


@pytest.mark.low
class SaleInputSchema_test:
    def functionality_test(self):
        sale_input = sale_input_factory()

        assert sale_input.name == "Winter Sale"
        assert sale_input.discount_perc == 25

    def requires_all_sale_fields_test(self):
        with pytest.raises(ValidationError):
            SaleInput.model_validate({})


@pytest.mark.low
class SaleAnalyticsSchema_test:
    def functionality_test(self):
        analytics = sale_analytics_factory()

        assert analytics.revenue == 5000
        assert analytics.order_count == 8
        assert analytics.revenue_lost == 250


@pytest.mark.low
class AdminSearchParamsSchema_test:
    def functionality_test(self):
        params = admin_search_params_factory()

        assert params.activation == [
            Activation.active,
            Activation.upcoming,
        ]
        assert params.sort is AdminSort.discount_perc
        assert params.is_ascending is False

    def rejects_missing_required_fields_test(self):
        with pytest.raises(ValidationError):
            AdminSearchParams.model_validate({})
