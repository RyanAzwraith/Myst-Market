import pytest

from app.core.exceptions import (
    ConflictException,
    ContentNotFoundException,
)
from tests.implementations.database.sqlite.fixtures import (
    product_model_factory,
    review_model_factory,
    user_model_factory,
)


@pytest.mark.medium
class SqliteReviewGetForProduct_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
                review_model_factory(
                    review_id=1,
                    rating=4,
                    description="Good",
                ),
                review_model_factory(
                    review_id=2,
                    rating=5,
                    description="Excellent",
                ),
            ]
        )
        sqlite_session.commit()

        reviews, average, has_review = (
            session_database.review.get_for_product(
                1,
                user_id=1,
            )
        )

        assert [review.id for review in reviews] == [2, 1]
        assert average == 4.5
        assert has_review is True

    def reports_when_user_has_no_review_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
            ]
        )
        sqlite_session.commit()

        _, average, has_review = session_database.review.get_for_product(
            1,
            user_id=1,
        )

        assert average == 0
        assert has_review is False


@pytest.mark.medium
class SqliteReviewCreate_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
            ]
        )
        sqlite_session.commit()

        review = session_database.review.create(
            user_id=1,
            product_id=1,
            rating=5,
            description="Excellent",
        )

        assert review.id == 1
        assert review.user_name == "Test User"
        assert review.product_slug == "battle-axe"

    def rejects_duplicate_user_reviews_test(
        self,
        session_database,
        sqlite_session,
    ):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
                review_model_factory(),
            ]
        )
        sqlite_session.commit()

        with pytest.raises(
            ConflictException,
            match="already reviewed",
        ):
            session_database.review.create(
                user_id=1,
                product_id=1,
                rating=4,
                description=None,
            )


@pytest.mark.medium
class SqliteReviewDelete_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
                review_model_factory(),
            ]
        )
        sqlite_session.commit()

        session_database.review.delete(1, user_id=1)

        assert sqlite_session.get(
            type(review_model_factory()),
            1,
        ) is None

    def rejects_wrong_user_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                user_model_factory(
                    user_id=2,
                    email="other@example.com",
                ),
                product_model_factory(),
                review_model_factory(),
            ]
        )
        sqlite_session.commit()

        with pytest.raises(
            ContentNotFoundException,
            match="Review Not Found",
        ):
            session_database.review.delete(1, user_id=2)


@pytest.mark.medium
class SqliteReviewAggregates_test:
    def functionality_test(self, session_database, sqlite_session):
        sqlite_session.add_all(
            [
                user_model_factory(),
                product_model_factory(),
                review_model_factory(rating=3),
                review_model_factory(
                    review_id=2,
                    rating=5,
                    description="Great",
                ),
                review_model_factory(
                    review_id=3,
                    rating=2,
                    description=None,
                ),
            ]
        )
        sqlite_session.commit()

        testimonials = session_database.review.get_testimonials(2)
        average = session_database.review.get_average_rating()

        assert [review.id for review in testimonials] == [2]
        assert average == pytest.approx(10 / 3)

    def returns_zero_average_without_reviews_test(
        self,
        session_database,
    ):
        assert session_database.review.get_average_rating() == 0
