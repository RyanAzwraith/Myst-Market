from app.api.api_model import APIModel
from datetime import datetime

class ReviewDetail(APIModel):
    review_id: int
    user_name: str
    product_id: int
    created_at: datetime
    rating: int
    description: str = None

    class from_:
        def Review(o):
            return ReviewDetail(
                review_id = o.id,
                user_name = o.user.name,
                product_id = o.product_id,
                created_at = o.created_at,
                rating = o.rating,
                description = o.description
            )

class ReviewSummary(APIModel):
    rating: int
    description: str = None

# Routes
# GET /products/{product_id}/reviews
# POST /products/{product_id}/reviews
# GET /user/me/reviews
# DELETE /reviews/{review_id}  

class GetProductReviewsResponse(APIModel):
    review_details: list[ReviewDetail]
    average: int
    user_has_review: bool

class PostProductReviewRequest(APIModel):
    review_summary: ReviewSummary

class GetUserReviewsResponse(APIModel):
    review_details: list[ReviewDetail]
    






