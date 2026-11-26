import pytest
from pydantic import ValidationError

from app.features.product.schema import (
    AdminSearchParams,
    Category,
    ProductFields,
    Rarity,
    SearchParams,
    Sort,
)
from tests.features.product.fixtures import (
    admin_search_params_factory,
    product_fields_factory,
    search_params_factory,
)


@pytest.mark.low
class ProductFieldsSchema_test:
    def functionality_test(self):
        fields = product_fields_factory()

        assert fields.name == "Battle Axe"
        assert fields.category_name == "weapons"
        assert fields.price_aud_cent == 2500

    def requires_product_fields_test(self):
        with pytest.raises(ValidationError):
            ProductFields.model_validate({})


@pytest.mark.low
class SearchParamsSchema_test:
    def functionality_test(self):
        params = search_params_factory()

        assert params.categories == [Category.weapons]
        assert params.rarities == [Rarity.rare]
        assert params.sort is Sort.price
        assert params.is_ascending is True

    def permits_empty_search_filters_test(self):
        params = SearchParams()

        assert params.categories is None
        assert params.rarities is None
        assert params.sort is None


@pytest.mark.low
class AdminSearchParamsSchema_test:
    def functionality_test(self):
        params = admin_search_params_factory()

        assert params.categories == [Category.weapons]
        assert params.rarities == [Rarity.rare]
        assert params.is_discontinued is False

    def permits_empty_admin_search_filters_test(self):
        params = AdminSearchParams()

        assert params.categories is None
        assert params.rarities is None
        assert params.is_discontinued is None
