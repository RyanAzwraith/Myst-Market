import pytest

from app.core.exceptions import (
    ConflictException,
    ContentNotFoundException
)

from app.features.review.review_service import (
    get_product_reviews_response,
    create_review,
    get_review_details_with_user_id,
    delete_review,
)
from app.features.review.review_schemas import (
    ReviewSummary,
)
from review_feature.review_fixtures import get_review

class get_product_reviews_response_test:
    def functionality_test(
        _, session, user, product, review, review_seed
    ):
        result = get_product_reviews_response(
            session, product_id=product.id, user_id=user.id
        )

        review_entities = result.review_details
        assert len(review_entities) > 1
        assert review_entities[0].product_id == product.id
        assert all(
            review.product_id == product.id
            for review in review_entities
        )

        average = result.average
        ratings= [
            o.rating for o in [*review_seed, review] if o.product_id == product.id
        ]
        assert average == round(sum(ratings) / len(ratings))

        user_has_review = result.user_has_review
        assert user_has_review

    def no_user_test(
        _, session, product, review_seed
    ):
        result = get_product_reviews_response(
            session, product_id=product.id, user_id=None)

        user_has_review = result.user_has_review
        assert not user_has_review

    def no_reviews_test(
        _, session, product
    ):
        result = get_product_reviews_response(
            session, product_id=product.id, user_id=None)

        review_entities = result.review_details
        assert len(review_entities) == 0

        average = result.average
        assert average == 0


rating = 2
description = "very pog"

class create_review_test:
    def functionality_test(_, session, user, product):
        create_review(
            session,
            product.id,
            user.id,
            review_summary=ReviewSummary(rating=rating, description=description),
        )
        review_entity = get_review(session, user.id, product.id)

        assert review_entity.product_id == product.id
        assert review_entity.user_id == user.id
        assert review_entity.rating == rating
        assert review_entity.description == description

    def rejects_if_user_and_product_already_has_review_test(
        _, session, review_factory, user, product
    ):
        review_factory()
        with pytest.raises(ConflictException):
            create_review(
                session,
                product.id,
                user.id,
                review_summary=ReviewSummary(rating=rating, description=description),
            )

    def max_rating_5_test(_, session, user, product):
        create_review(
            session,
            product.id,
            user.id,
            review_summary=ReviewSummary(
                rating=1200, description=description
            ),
        )
        review_entity = get_review(session, user.id, product.id)
        assert review_entity.rating == 5


class get_review_details_with_user_id_test:
    def functionality_test(_, session, review_seed, user):
        review_entities = get_review_details_with_user_id(
            session, user.id
        )

        assert len(review_entities) > 1
        assert review_entities[0].user_name == user.name
        assert all(
            o.user_name == user.name
            for o in review_entities
        )


class delete_review_test:
    def functionality_test(_, session, user, product, review):
        delete_review(
            session, user_id=user.id, review_id=review.id
        )
        assert get_review(session, user.id, product.id) is None

    def missing_review(_, session, user, product):
        with pytest.raises(ContentNotFoundException):
            delete_review(
                session, user_id=user.id, review_id=500
            )

    def wrong_user_test(_, session, user, product, review):
        with pytest.raises(ConflictException):
            delete_review(
                session, user_id=500, review_id=review.id
            )
