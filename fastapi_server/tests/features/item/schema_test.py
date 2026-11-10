import pytest
from pydantic import ValidationError

from app.features.item.schema import (
    ItemResolution,
    ItemSummary,
)
from tests.features.item.fixtures import (
    item_factory,
    item_resolution_factory,
    item_summary_factory,
)


@pytest.mark.low
class ItemSchema_test:
    def functionality_test(self):
        item = item_factory()

        assert item.product.id == 11
        assert item.quantity == 2
        assert item.price_cent == 2000
        assert item.on_sale is True


@pytest.mark.low
class ItemSummarySchema_test:
    def functionality_test(self):
        item = item_summary_factory()

        assert item.product_id == 11
        assert item.quantity == 2

    def requires_product_and_quantity_test(self):
        with pytest.raises(ValidationError):
            ItemSummary.model_validate({})


@pytest.mark.low
class ItemResolutionSchema_test:
    def functionality_test(self):
        item = item_resolution_factory()

        assert item.product.id == 11
        assert item.unit_price_cent == 2000
        assert item.line_total_cent == 4000
        assert item.on_sale is True

    def permits_an_optional_warning_test(self):
        item = item_resolution_factory()
        warning = ItemResolution.model_validate(
            {
                **item.model_dump(),
                "warning": "Only 1 in stock",
            }
        )

        assert item.warning is None
        assert warning.warning == "Only 1 in stock"
