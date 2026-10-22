from __future__ import annotations

from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    ContentNotFoundException,
)
from app.features.review.schema import Review as ReviewSchema
from app.interfaces.database_schemas.Review import (
    ProductReviews,
    Review as ReviewInterface,
)

from ..common import get_model, validate_pagination
from ..models.product import Product as ProductModel
from ..models.review import Review as ReviewModel
from ..models.user import User as UserModel


class SqliteReview(ReviewInterface):
    def __init__(self, session: Session):
        self._session = session

    def get_for_product(
        self,
        product_id: int,
        user_id: int | None = None,
    ) -> ProductReviews:
        get_model(
            self._session,
            ProductModel,
            "Product",
            product_id,
        )

        statement = self._review_statement().where(
            ReviewModel.product_id == product_id,
        ).order_by(
            ReviewModel.created_at.desc(),
            ReviewModel.id.desc(),
        )
        reviews = self._session.execute(statement).mappings().all()

        average = self._average_for_product(product_id)
        user_has_review = False
        if user_id is not None:
            user_has_review = self._session.scalar(
                select(ReviewModel.id).where(
                    ReviewModel.product_id == product_id,
                    ReviewModel.user_id == user_id,
                )
            ) is not None

        return ProductReviews(
            reviews=[self._to_schema(row) for row in reviews],
            average=average,
            user_has_review=user_has_review,
        )

    def get_for_user(self, user_id: int) -> list[ReviewSchema]:
        get_model(
            self._session,
            UserModel,
            "User",
            user_id,
        )
        statement = self._review_statement().where(
            ReviewModel.user_id == user_id,
        ).order_by(
            ReviewModel.created_at.desc(),
            ReviewModel.id.desc(),
        )
        reviews = self._session.execute(statement).mappings().all()
        return [self._to_schema(row) for row in reviews]

    def get_testimonials(self, limit: int) -> list[ReviewSchema]:
        validate_pagination(limit, 0)
        statement = self._review_statement().where(
            ReviewModel.description.is_not(None),
            ReviewModel.description != "",
            ReviewModel.rating >= 4,
        ).order_by(
            ReviewModel.rating.desc(),
            ReviewModel.created_at.desc(),
            ReviewModel.id.desc(),
        ).limit(limit)
        reviews = self._session.execute(statement).mappings().all()
        return [self._to_schema(row) for row in reviews]

    def get_average_rating(self) -> float:
        average = self._session.scalar(
            select(func.avg(ReviewModel.rating))
        )
        return float(average or 0)

    def create(
        self,
        user_id: int,
        product_id: int,
        rating: int,
        description: str | None,
    ) -> ReviewSchema:
        get_model(
            self._session,
            UserModel,
            "User",
            user_id,
        )
        get_model(
            self._session,
            ProductModel,
            "Product",
            product_id,
        )

        existing_review = self._session.scalar(
            select(ReviewModel).where(
                ReviewModel.user_id == user_id,
                ReviewModel.product_id == product_id,
            )
        )
        if existing_review is not None:
            raise ConflictException(
                "User has already reviewed this product",
                details={
                    "user_id": user_id,
                    "product_id": product_id,
                },
            )

        review = ReviewModel(
            user_id=user_id,
            product_id=product_id,
            rating=rating,
            description=description,
        )
        self._session.add(review)
        self._session.commit()
        self._session.refresh(review)

        row = self._session.execute(
            self._review_statement().where(
                ReviewModel.id == review.id,
            )
        ).mappings().one()
        return self._to_schema(row)

    def delete(
        self,
        review_id: int,
        user_id: int | None = None,
    ) -> None:
        statement = select(ReviewModel).where(
            ReviewModel.id == review_id,
        )
        if user_id is not None:
            statement = statement.where(
                ReviewModel.user_id == user_id,
            )

        review = self._session.scalar(statement)
        if review is None:
            raise ContentNotFoundException(
                "Review Not Found",
                details={"review_id": review_id},
            )

        self._session.delete(review)
        self._session.commit()

    @staticmethod
    def _review_statement() -> Select[Any]:
        return (
            select(
                ReviewModel.id.label("id"),
                UserModel.name.label("user_name"),
                ReviewModel.product_id.label("product_id"),
                ProductModel.slug.label("product_slug"),
                ReviewModel.created_at.label("created_at"),
                ReviewModel.rating.label("rating"),
                ReviewModel.description.label("description"),
            )
            .join(
                UserModel,
                UserModel.id == ReviewModel.user_id,
            )
            .join(
                ProductModel,
                ProductModel.id == ReviewModel.product_id,
            )
        )

    def _average_for_product(self, product_id: int) -> float:
        average = self._session.scalar(
            select(func.avg(ReviewModel.rating)).where(
                ReviewModel.product_id == product_id,
            )
        )
        return float(average or 0)

    @staticmethod
    def _to_schema(row: Any) -> ReviewSchema:
        return ReviewSchema(
            id=row["id"],
            user_name=row["user_name"] or "",
            product_id=row["product_id"],
            product_slug=row["product_slug"],
            created_at=row["created_at"],
            rating=row["rating"] or 0,
            description=row["description"],
        )
