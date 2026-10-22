import pytest

from tests.features.review.fixtures import (
    review_factory,
    review_input_factory,
)


@pytest.mark.medium
class CreateReviewHandler_test:
    def functionality_test(self, review_client, database):
        review_input = review_input_factory()

        response = review_client.post(
            "/review",
            json={
                "reviewInput": {
                    "productId": review_input.product_id,
                    "rating": review_input.rating,
                    "description": review_input.description,
                },
            },
        )

        assert response.status_code == 201
        database.review.create.assert_called_once_with(
            user_id=8,
            product_id=review_input.product_id,
            rating=review_input.rating,
            description=review_input.description,
        )

    def permits_an_omitted_description_test(
        self,
        review_client,
        database,
    ):
        response = review_client.post(
            "/review",
            json={
                "reviewInput": {
                    "productId": 11,
                    "rating": 4,
                },
            },
        )

        assert response.status_code == 201
        database.review.create.assert_called_once_with(
            user_id=8,
            product_id=11,
            rating=4,
            description=None,
        )

    def missing_review_input_returns_validation_error_test(
        self,
        review_client,
    ):
        response = review_client.post("/review", json={})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"


@pytest.mark.medium
class DeleteReviewHandler_test:
    def functionality_test(self, review_client, database):
        response = review_client.delete("/review/4")

        assert response.status_code == 204
        database.review.delete.assert_called_once_with(
            4,
            user_id=8,
        )


@pytest.mark.medium
class RetrieveTestimonialsHandler_test:
    def functionality_test(self, review_client, database):
        review = review_factory()
        database.review.get_testimonials.return_value = [review]

        response = review_client.post(
            "/reviews/testimonials",
            json={"limit": 5},
        )

        assert response.status_code == 200
        assert response.json()["reviews"][0]["id"] == review.id
        database.review.get_testimonials.assert_called_once_with(5)

    def missing_limit_returns_validation_error_test(self, review_client):
        response = review_client.post("/reviews/testimonials", json={})

        assert response.status_code == 422
        assert response.json()["name"] == "RequestValidationError"
