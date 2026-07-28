import pytest

from app.db.models import (
    Review,
)

@pytest.fixture
def review_factory(
    session, user, product
) :
    def create_review( *,
        user_id = user.id,
        product_id = product.id,
        rating = 3,
        description = 'I am description'
    ):
        review_entity = Review(
            user_id = user_id,
            product_id = product_id,
            rating = rating,
            description = description
        )
        session.add(review_entity)
        session.commit()
        session.refresh(review_entity)
        return review_entity
    return create_review

@pytest.fixture
def review(
    review_factory
) :
    return review_factory()

@pytest.fixture
def review_seed(review_factory, review, user, user_seed, product, shop_seed):
    review_entities = [
        review_factory( 
            user_id=user.id, 
            product_id=shop_seed['products'][0].id,
            rating=1,
            description='horrible stuff'
        ),
        review_factory( 
            user_id=user_seed[0].id, 
            product_id=product.id,
            rating=4,
            description='much wow'
        ),
    ]
    return review_entities

def get_review(session, user_id, product_id):
    return (
        session.query(Review)
        .filter(
            Review.user_id == user_id,
            Review.product_id == product_id,
        )
        .first()
    )