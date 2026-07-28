from fastapi import APIRouter, Depends

from app.api.dependencies import (
    get_session,
    get_current_user,
    get_optional_user,
)
from .review_schemas import (
    GetProductReviewsResponse,
    PostProductReviewRequest,
    GetUserReviewsResponse
)
from .review_service import (
    get_product_reviews_response,
    create_review,
    get_review_details_with_user_id,
    delete_review,
)

router = APIRouter()

@router.get(
    "/products/{product_id}/reviews",
    status_code=200,
    response_model= GetProductReviewsResponse
)
async def get_product_reviews_route(
    product_id: int,
    user_entity = Depends(get_optional_user),
    session = Depends(get_session),
):
    user_id = user_entity.id if user_entity else None
    return get_product_reviews_response(
        session,
        product_id,
        user_id,
    )


@router.post(
    "/products/{product_id}/reviews",
    status_code=201,
)
async def post_product_review_review_route(
    product_id: int,
    req: PostProductReviewRequest,
    user_entity = Depends(get_current_user),
    session = Depends(get_session),
):
    create_review(session, product_id, user_entity.id, req.review_summary)
    return

@router.get(
    "/user/me/reviews",
    status_code=200,
    response_model= GetUserReviewsResponse
)
async def get_user_reviews_route(
    user_entity = Depends(get_current_user),
    session=Depends(get_session)
):
    review_details = get_review_details_with_user_id(session, user_entity.id)
    return GetUserReviewsResponse(
        review_details = review_details
    )

@router.delete(
    "/reviews/{review_id}",
    status_code=204,
)
async def delete_review_route(
    review_id: int,
    user_entity = Depends(get_current_user),
    session = Depends(get_session)
):
    delete_review(session, user_entity.id, review_id)
    return
