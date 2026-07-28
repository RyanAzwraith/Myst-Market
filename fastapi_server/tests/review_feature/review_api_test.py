import pytest

from app.features.review.review_api import (
    get_product_reviews_route,
    post_product_review_review_route,
    get_user_reviews_route,
    delete_review_route,
)
from app.features.review.review_schemas import (
    ReviewSummary,
    PostProductReviewRequest
)
from review_feature.review_fixtures import get_review

class get_product_reviews_route_test:
    @pytest.mark.asyncio
    async def functionality_test(
        _, session, review_seed, product, user
    ):
        result = await get_product_reviews_route(
            product.id, user, session 
        )
        assert len(result.review_details)
        assert result.average
        assert result.user_has_review

rating = 2
description = "very pog"

class post_product_review_review_route_test:
    @pytest.mark.asyncio
    async def functionality_test(
        _, session, product, user
    ):
        req = PostProductReviewRequest(
            review_summary = ReviewSummary(
                rating = rating,
                description = description,
            )
        )
        result = await post_product_review_review_route(
            product.id, req, user, session 
        )
        assert result is None

class get_user_reviews_route_test:
    @pytest.mark.asyncio
    async def functionality_test(
        _, session, review_seed, user
    ):
        result = await get_user_reviews_route(
            user, session 
        )
        assert len(result.review_details)

class delete_review_route_test:
    @pytest.mark.asyncio
    async def functionality_test(
        _, session, review, user, product
    ):
        result = await delete_review_route(
            review.id, user, session 
        )
        assert result is None