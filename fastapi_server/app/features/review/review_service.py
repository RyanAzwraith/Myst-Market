from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.exceptions import (
    ContentNotFoundException,
    ConflictException
)

from app.db.models import (
    Review,
)
from .review_schemas import (
    GetProductReviewsResponse,
    ReviewSummary,
    ReviewDetail,
)

def get_product_reviews_response(
    session: Session,
    product_id: int,
    user_id: int | None,
) -> GetProductReviewsResponse:
    
    review_entities = (
        session.query(Review)
        .filter(Review.product_id == product_id)
        .all()
    )

    average_rating = round(
        session.query(
            func.coalesce(func.avg(Review.rating), 0)
        )
        .filter(Review.product_id == product_id)
        .scalar()
    )

    user_has_review = False
    if user_id:
        user_has_review = (
            session.query(Review)
            .filter(
                Review.product_id == product_id,
                Review.user_id == user_id,
            )
            .first()
            is not None
        )

    return GetProductReviewsResponse(
        reviewDetails = map(ReviewDetail.from_Review, review_entities),
        average = average_rating,
        user_has_review = user_has_review
    )

def create_review(
    session: Session, 
    product_id: int,
    user_id: int, 
    review_summary: ReviewSummary
) -> None:
    review_entity = (
        session.query(Review)
        .filter(
            Review.user_id == user_id,
            Review.product_id == product_id
        )
        .first()
    )
    if review_entity: 
        raise ConflictException(
            f"Review already exisits with user id: {user_id}"
        )

    rating = 5 if review_summary.rating > 5 else review_summary.rating
    
    review_entity = Review(
        user_id = user_id,
        product_id = product_id,
        rating = rating,
        description = review_summary.description
    )
    session.add(review_entity)    
    session.commit()

def get_review_details_with_user_id(
    session: Session,
    user_id: int,
)  -> list[ReviewDetail]:
    review_entities = (
        session.query(Review)
        .filter(
            Review.user_id == user_id,
        )
        .all()
    )
    return list(map(ReviewDetail.from_Review, review_entities))

def delete_review(
    session: Session, 
    user_id: int,
    review_id: int,
) -> None:
    review_entity = (
        session.query(Review)
        .filter( Review.id == review_id)
        .first()
    )
    if not review_entity:
        raise ContentNotFoundException(
            f"Review not found with id: {review_id}"
        )
    if review_entity.user_id != user_id:
        raise ConflictException(
            f"User does not have Review with id: {review_id}"
        )

    session.delete(review_entity)
    session.commit()

    return
    