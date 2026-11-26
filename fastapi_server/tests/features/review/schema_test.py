import pytest
from pydantic import ValidationError

from app.features.review.schema import ReviewInput
from tests.features.review.fixtures import (
    review_factory,
    review_input_factory,
)


@pytest.mark.low
class ReviewSchema_test:
    def functionality_test(self):
        review = review_factory()

        assert review.id == 4
        assert review.product_id == 11
        assert review.rating == 5
        assert review.description == "Excellent product"

    def permits_a_missing_description_test(self):
        review = review_factory(description=None)

        assert review.description is None


@pytest.mark.low
class ReviewInputSchema_test:
    def functionality_test(self):
        review_input = review_input_factory()

        assert review_input.product_id == 11
        assert review_input.rating == 5

    def requires_product_and_rating_test(self):
        with pytest.raises(ValidationError):
            ReviewInput.model_validate({})
