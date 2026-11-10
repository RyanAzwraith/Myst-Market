import pytest
from pydantic import ValidationError

from app.features.order.schema import (
    Address,
    AdminSearchParams,
    AdminSort,
    Order,
    OrderSummary,
    Status,
)
from tests.features.order.fixtures import (
    address_factory,
    admin_search_params_factory,
    order_factory,
    order_summary_factory,
)


@pytest.mark.low
class AddressSchema_test:
    def functionality_test(self):
        address = address_factory()

        assert address.country_code == "AU"
        assert address.postcode == "3000"
        assert address.street == "1 Test Street"

    def requires_all_address_fields_test(self):
        with pytest.raises(ValidationError):
            Address.model_validate({})


@pytest.mark.low
class OrderSchema_test:
    def functionality_test(self):
        order = order_factory()

        assert order.id == 12
        assert order.user_id == 8
        assert order.status is Status.pending
        assert order.cost_aud_cent == 4000


@pytest.mark.low
class OrderSummarySchema_test:
    def functionality_test(self):
        order = order_summary_factory()

        assert order.id == 12
        assert order.total_cent == 4000
        assert order.status is Status.pending


@pytest.mark.low
class AdminSearchParamsSchema_test:
    def functionality_test(self):
        params = admin_search_params_factory()

        assert params.search_name == "Test User"
        assert params.status == [
            Status.pending,
            Status.processing,
        ]
        assert params.sort is AdminSort.cost

    def permits_omitted_search_filters_test(self):
        params = AdminSearchParams()

        assert params.search_name is None
        assert params.status is None
        assert params.sort is None
