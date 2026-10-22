from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import (
    Select,
    and_,
    case,
    desc,
    false,
    func,
    or_,
    select,
)
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, ContentNotFoundException
from app.features.user.schema import User as UserSchema
from app.features.user.schema import UserAnalytics
from app.interfaces.database_schemas.User import User as UserInterface

from ..common import (
    LOST_ORDER_STATUSES,
    SUCCESSFUL_ORDER_STATUSES,
    execute_page,
    get_model,
)
from ..models.order import Order as OrderModel
from ..models.review import Review as ReviewModel
from ..models.user import User as UserModel


class SqliteUser(UserInterface):
    def __init__(self, session: Session):
        self._session = session

    def get(self, user_id: int) -> UserSchema:
        user = get_model(self._session, UserModel, "User", user_id)
        return self._to_schema(user)

    def get_by_email(self, email: str) -> UserSchema:
        user = self._session.scalar(
            select(UserModel).where(UserModel.email == email)
        )
        if user is None:
            raise ContentNotFoundException(
                "User Not Found",
                details={"user_email": email},
            )
        return self._to_schema(user)

    def search(
        self,
        search: str | None,
        registrations: list[str] | None,
        sort_by: str | None,
        is_ascending: bool | None,
        limit: int | None,
        offset: int,
    ) -> tuple[list[UserAnalytics], bool]:
        expressions = self._analytics_expressions()
        statement = self._analytics_statement(expressions)
        statement = statement.where(
            *self._registration_filters(registrations),
        )

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    UserModel.email.ilike(search_pattern),
                    UserModel.name.ilike(search_pattern),
                )
            )

        statement = statement.order_by(
            self._sort_column(sort_by, is_ascending, expressions),
            UserModel.id,
        )
        rows, has_more = execute_page(
            self._session,
            statement,
            limit,
            offset,
        )

        return [self._to_analytics(row) for row in rows], has_more

    def get_analytics(self, user_id: int) -> UserAnalytics:
        statement = self._analytics_statement(
            self._analytics_expressions()
        ).where(
            UserModel.id == user_id
        )
        row = self._session.execute(statement).mappings().first()
        if row is None:
            raise ContentNotFoundException(
                "User Not Found",
                details={"user_id": user_id},
            )
        return self._to_analytics(row)

    def create(
        self,
        email: str,
        name: str | None,
        is_registered: bool,
        password_hash: str | None = None,
    ) -> UserSchema:
        user = self._session.scalar(
            select(UserModel).where(UserModel.email == email)
        )

        if user is not None:
            if user.is_registered:
                raise ConflictException(
                    "User with email already exists",
                    details={"user_email": email},
                )

            user.name = name
            user.is_registered = is_registered
            user.deleted_at = None
            if password_hash is not None:
                user.password_hash = password_hash
        else:
            user = UserModel(
                email=email,
                name=name,
                is_registered=is_registered,
                password_hash=password_hash,
            )
            self._session.add(user)

        self._session.commit()
        self._session.refresh(user)
        return self._to_schema(user)

    def patch(
        self,
        user_id: int,
        email: str | None = None,
        name: str | None = None,
        is_registered: bool | None = None,
        is_admin: bool | None = None,
        password_hash: str | None = None,
    ) -> UserSchema:
        user = get_model(self._session, UserModel, "User", user_id)

        if email is not None and email != user.email:
            existing_user = self._session.scalar(
                select(UserModel).where(UserModel.email == email)
            )
            if existing_user is not None:
                raise ConflictException(
                    "User with email already exists",
                    details={"user_email": email},
                )

        updates = {
            "email": email,
            "name": name,
            "is_registered": is_registered,
            "is_admin": is_admin,
            "password_hash": password_hash,
        }
        for field, value in updates.items():
            if value is not None:
                setattr(user, field, value)

        self._session.commit()
        self._session.refresh(user)
        return self._to_schema(user)

    def delete(self, user_id: int) -> None:
        user = get_model(self._session, UserModel, "User", user_id)
        user.name = None
        user.password_hash = None
        user.is_registered = False
        user.is_admin = False
        user.deleted_at = date.today()
        self._session.commit()

    def count_customers(self) -> int:
        statement = select(func.count(UserModel.id)).where(
            UserModel.is_registered.is_(True),
            UserModel.deleted_at.is_(None),
        )
        return self._session.scalar(statement) or 0

    @staticmethod
    def _to_schema(user: UserModel) -> UserSchema:
        return UserSchema(
            id=user.id,
            email=user.email,
            name=user.name or "",
            is_admin=user.is_admin,
            is_registered=user.is_registered,
        )

    @staticmethod
    def _to_analytics(row: Any) -> UserAnalytics:
        return UserAnalytics(
            id=row["id"],
            email=row["email"],
            name=row["name"] or "",
            is_registered=row["is_registered"],
            created_at=row["created_at"],
            deleted_at=row["deleted_at"],
            order_count=row["order_count"],
            spent=row["spent"],
            revenue_lost=row["revenue_lost"],
            review_count=row["review_count"],
        )

    @staticmethod
    def _registration_filters(
        registrations: list[str] | None,
    ) -> list[Any]:
        if registrations is None:
            return []

        filters = []
        for registration in registrations:
            if registration == "registered":
                filters.append(
                    and_(
                        UserModel.is_registered.is_(True),
                        UserModel.deleted_at.is_(None),
                    )
                )
            elif registration == "guest":
                filters.append(
                    and_(
                        UserModel.is_registered.is_(False),
                        UserModel.deleted_at.is_(None),
                    )
                )
            elif registration == "deleted":
                filters.append(UserModel.deleted_at.is_not(None))
            else:
                raise ValueError(
                    f"Unsupported registration filter: {registration}"
                )

        if not filters:
            return [false()]

        return [or_(*filters)]

    @staticmethod
    def _analytics_expressions() -> dict[str, Any]:
        order_count = (
            select(func.count(OrderModel.id))
            .where(OrderModel.user_id == UserModel.id)
            .correlate(UserModel)
            .scalar_subquery()
        )
        spent = (
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                OrderModel.status.in_(
                                    SUCCESSFUL_ORDER_STATUSES
                                ),
                                OrderModel.cost_aud_cent,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                )
            )
            .where(OrderModel.user_id == UserModel.id)
            .correlate(UserModel)
            .scalar_subquery()
        )
        revenue_lost = (
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                OrderModel.status.in_(LOST_ORDER_STATUSES),
                                OrderModel.cost_aud_cent,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                )
            )
            .where(OrderModel.user_id == UserModel.id)
            .correlate(UserModel)
            .scalar_subquery()
        )
        review_count = (
            select(func.count(ReviewModel.id))
            .where(ReviewModel.user_id == UserModel.id)
            .correlate(UserModel)
            .scalar_subquery()
        )
        return {
            "order_count": order_count,
            "spent": spent,
            "revenue_lost": revenue_lost,
            "review_count": review_count,
        }

    @staticmethod
    def _analytics_statement(
        expressions: dict[str, Any],
    ) -> Select[Any]:
        return select(
            UserModel.id.label("id"),
            UserModel.email.label("email"),
            UserModel.name.label("name"),
            UserModel.is_registered.label("is_registered"),
            UserModel.created_at.label("created_at"),
            UserModel.deleted_at.label("deleted_at"),
            expressions["order_count"].label("order_count"),
            expressions["spent"].label("spent"),
            expressions["revenue_lost"].label("revenue_lost"),
            expressions["review_count"].label("review_count"),
        )

    @staticmethod
    def _sort_column(
        sort_by: str | None,
        is_ascending: bool | None,
        expressions: dict[str, Any],
    ) -> Any:
        columns = {
            "alphabet": func.lower(
                func.coalesce(UserModel.name, UserModel.email)
            ),
            "createdAt": UserModel.created_at,
            "orderCount": expressions["order_count"],
            "spent": expressions["spent"],
            "revenueLost": expressions["revenue_lost"],
            "reviewCount": expressions["review_count"],
        }

        if sort_by is not None and sort_by not in columns:
            raise ValueError(f"Unsupported user sort: {sort_by}")

        column = columns.get(sort_by, UserModel.created_at)
        ordering = column.asc() if is_ascending else desc(column)
        return ordering
