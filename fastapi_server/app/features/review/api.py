from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_db
from app.api.paths import Paths
from app.core.Base import Base

from .schema import Review, ReviewInput

review_router = APIRouter()


# Create Review
class CreateReviewRequest(Base):
    review_input: ReviewInput

@review_router.post(
    Paths.Review.create,
    status_code=201,
    dependencies=[Depends(get_current_user)],
)
async def create_review_handler(
    req: CreateReviewRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    db.review.create(
        user_id=user.id,
        product_id=req.review_input.product_id,
        rating=req.review_input.rating,
        description=req.review_input.description,
    )


# Delete Review
@review_router.delete(
    Paths.Review.byId("{id}"),
    status_code=204,
    dependencies=[Depends(get_current_user)],
)
async def delete_review_handler(
    id: int,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    db.review.delete(id, user_id=user.id)


reviews_router = APIRouter()


# Retrieve Testimonials
class RetrieveTestimonialsResponse(Base):
    reviews: list[Review]

class RetrieveTestimonialsRequest(Base):
    limit: int

@reviews_router.post(
    Paths.Reviews.testimonials,
    status_code=200,
    response_model=RetrieveTestimonialsResponse,
)
async def retrieve_testimonials_handler(
    req: RetrieveTestimonialsRequest,
    db=Depends(get_db),
):
    reviews = db.review.get_testimonials(req.limit)
    return RetrieveTestimonialsResponse(reviews=reviews)