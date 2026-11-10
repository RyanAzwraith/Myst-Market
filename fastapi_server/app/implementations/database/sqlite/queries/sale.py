from __future__ import annotations

from datetime import date, timedelta
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
from app.features.sale.schema import Sale as SaleSchema
from app.features.sale.schema import SaleAnalytics
from app.interfaces.database_schemas.Sale import Sale as SaleInterface

from ..common import (
    LOST_ORDER_STATUSES,
    execute_page,
    get_model,
    validate_pagination,
)
from ..models.item import Item as ItemModel
from ..models.order import Order as OrderModel
from ..models.sale import Sale as SaleModel


class SqliteSale(SaleInterface):
    def __init__(self, session: Session):
        self._session = session

    def get(self, sale_id: int) -> SaleSchema:
        sale = get_model(self._session, SaleModel, "Sale", sale_id)
        return self._to_schema(sale)

    def get_by_slug(self, slug: str) -> SaleSchema:
        sale = self._session.scalar(
            select(SaleModel).where(SaleModel.slug == slug)
        )
        if sale is None:
            raise ContentNotFoundException(
                "Sale Not Found",
                details={"sale_slug": slug},
            )
        return self._to_schema(sale)

    def get_all(self) -> list[SaleSchema]:
        statement = select(SaleModel).order_by(
            SaleModel.start_at.desc(),
            SaleModel.id.desc(),
        )
        sales = self._session.scalars(statement).all()
        return [self._to_schema(sale) for sale in sales]

    def get_biggest(self, limit: int) -> list[SaleSchema]:
        validate_pagination(limit, 0)
        today = date.today()
        statement = (
            select(SaleModel)
            .where(
                SaleModel.start_at <= today,
                SaleModel.end_at >= today,
            )
            .order_by(
                SaleModel.discount_perc.desc(),
                SaleModel.id,
            )
            .limit(limit)
        )
        sales = self._session.scalars(statement).all()
        return [self._to_schema(sale) for sale in sales]

    def get_analytics(self, sale_id: int) -> SaleAnalytics:
        statement = self._analytics_statement().where(
            SaleModel.id == sale_id
        )
        row = self._session.execute(statement).mappings().first()
        if row is None:
            raise ContentNotFoundException(
                "Sale Not Found",
                details={"sale_id": sale_id},
            )
        return self._to_analytics(row)

    def search_admin(
        self,
        search: str | None,
        activations: list[str] | None,
        sort_by: str | None,
        is_ascending: bool | None,
        limit: int | None,
        offset: int,
    ) -> tuple[list[SaleAnalytics], bool]:
        expressions = self._analytics_expressions()
        statement = self._analytics_statement(expressions)
        statement = statement.where(
            *self._activation_filters(activations),
        )

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    SaleModel.name.ilike(search_pattern),
                    SaleModel.slug.ilike(search_pattern),
                )
            )

        statement = statement.order_by(
            self._sort_column(sort_by, is_ascending, expressions),
            SaleModel.id,
        )
        rows, has_more = execute_page(
            self._session,
            statement,
            limit,
            offset,
        )
        return [self._to_analytics(row) for row in rows], has_more

    def create(
        self,
        discount_perc: int,
        start_at: date,
        end_at: date,
        name: str,
        slug: str,
        description: str | None,
    ) -> SaleSchema:
        self._ensure_slug_available(slug)
        sale = SaleModel(
            discount_perc=discount_perc,
            start_at=start_at,
            end_at=end_at,
            name=name,
            slug=slug,
            description=description,
        )
        self._session.add(sale)
        self._session.commit()
        self._session.refresh(sale)
        return self._to_schema(sale)

    def patch(
        self,
        sale_id: int,
        name: str | None = None,
        slug: str | None = None,
        description: str | None = None,
        start_at: date | None = None,
        end_at: date | None = None,
        discount_perc: int | None = None,
    ) -> SaleSchema:
        sale = get_model(self._session, SaleModel, "Sale", sale_id)
        if slug is not None and slug != sale.slug:
            self._ensure_slug_available(slug, sale_id)

        updates = {
            "name": name,
            "slug": slug,
            "description": description,
            "start_at": start_at,
            "end_at": end_at,
            "discount_perc": discount_perc,
        }
        for field, value in updates.items():
            if value is not None:
                setattr(sale, field, value)

        self._session.commit()
        self._session.refresh(sale)
        return self._to_schema(sale)

    def patch_many(
        self,
        sale_ids: list[int],
        start_at: date | None = None,
        end_at: date | None = None,
        discount_perc: int | None = None,
    ) -> None:
        sales = self._session.scalars(
            select(SaleModel).where(SaleModel.id.in_(sale_ids))
        ).all()
        found_ids = {sale.id for sale in sales}
        missing_ids = set(sale_ids) - found_ids
        if missing_ids:
            missing_id = min(missing_ids)
            raise ContentNotFoundException(
                "Sale Not Found",
                details={"sale_id": missing_id},
            )

        updates = {
            "start_at": start_at,
            "end_at": end_at,
            "discount_perc": discount_perc,
        }
        for sale in sales:
            for field, value in updates.items():
                if value is not None:
                    setattr(sale, field, value)

        self._session.commit()

    def delete(self, sale_id: int) -> None:
        sale = get_model(self._session, SaleModel, "Sale", sale_id)
        self._session.delete(sale)
        self._session.commit()

    def count_ending_within(self, days: int) -> int:
        if days < 0:
            raise ValueError("days must be non-negative")

        today = date.today()
        statement = select(func.count(SaleModel.id)).where(
            SaleModel.start_at <= today,
            SaleModel.end_at >= today,
            SaleModel.end_at <= today + timedelta(days=days),
        )
        return self._session.scalar(statement) or 0

    @staticmethod
    def _to_schema(sale: SaleModel) -> SaleSchema:
        return SaleSchema(
            id=sale.id,
            name=sale.name,
            slug=sale.slug,
            discount_perc=sale.discount_perc,
            description=sale.description or "",
            start_at=sale.start_at,
            end_at=sale.end_at,
        )

    @staticmethod
    def _to_analytics(row: Any) -> SaleAnalytics:
        return SaleAnalytics(
            id=row["id"],
            name=row["name"],
            slug=row["slug"],
            discount_perc=row["discount_perc"],
            description=row["description"] or "",
            start_at=row["start_at"],
            end_at=row["end_at"],
            revenue=row["revenue"],
            order_count=row["order_count"],
            revenue_lost=row["revenue_lost"],
        )

    def _ensure_slug_available(
        self,
        slug: str,
        sale_id: int | None = None,
    ) -> None:
        statement = select(SaleModel).where(SaleModel.slug == slug)
        if sale_id is not None:
            statement = statement.where(SaleModel.id != sale_id)
        if self._session.scalar(statement) is not None:
            raise ConflictException(
                "Sale with slug already exists",
                details={"sale_slug": slug},
            )

    @staticmethod
    def _activation_filters(
        activations: list[str] | None,
    ) -> list[Any]:
        if not activations:
            return []

        today = date.today()
        filters = []
        for activation in activations:
            if activation == "active":
                filters.append(
                    and_(
                        SaleModel.start_at <= today,
                        SaleModel.end_at >= today,
                    )
                )
            elif activation == "upcoming":
                filters.append(SaleModel.start_at > today)
            elif activation == "expired":
                filters.append(SaleModel.end_at < today)
            else:
                raise ValueError(
                    f"Unsupported sale activation: {activation}"
                )

        if not filters:
            return [false()]
        return [or_(*filters)]

    @staticmethod
    def _analytics_expressions() -> dict[str, Any]:
        line_total = (
            ItemModel.quantity * ItemModel.unit_price_aud_cent
        )
        revenue = (
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                OrderModel.status.notin_(
                                    LOST_ORDER_STATUSES
                                ),
                                line_total,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                )
            )
            .join(OrderModel, OrderModel.id == ItemModel.order_id)
            .where(
                ItemModel.sale_id == SaleModel.id,
                OrderModel.created_at >= SaleModel.start_at,
                OrderModel.created_at < SaleModel.end_at,
            )
            .correlate(SaleModel)
            .scalar_subquery()
        )
        order_count = (
            select(func.count(func.distinct(ItemModel.order_id)))
            .join(OrderModel, OrderModel.id == ItemModel.order_id)
            .where(
                ItemModel.sale_id == SaleModel.id,
                OrderModel.created_at >= SaleModel.start_at,
                OrderModel.created_at < SaleModel.end_at,
            )
            .correlate(SaleModel)
            .scalar_subquery()
        )
        revenue_lost = (
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                OrderModel.status.in_(LOST_ORDER_STATUSES),
                                ItemModel.quantity
                                * ItemModel.unit_price_aud_cent,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                )
            )
            .join(OrderModel, OrderModel.id == ItemModel.order_id)
            .where(ItemModel.sale_id == SaleModel.id)
            .where(OrderModel.created_at >= SaleModel.start_at)
            .where(OrderModel.created_at < SaleModel.end_at)
            .correlate(SaleModel)
            .scalar_subquery()
        )
        duration = (
            func.julianday(SaleModel.end_at)
            - func.julianday(SaleModel.start_at)
        )
        return {
            "revenue": revenue,
            "order_count": order_count,
            "revenue_lost": revenue_lost,
            "duration": duration,
        }

    @staticmethod
    def _analytics_statement(
        expressions: dict[str, Any] | None = None,
    ) -> Select[Any]:
        expressions = expressions or SqliteSale._analytics_expressions()
        return select(
            SaleModel.id.label("id"),
            SaleModel.name.label("name"),
            SaleModel.slug.label("slug"),
            SaleModel.discount_perc.label("discount_perc"),
            SaleModel.description.label("description"),
            SaleModel.start_at.label("start_at"),
            SaleModel.end_at.label("end_at"),
            expressions["revenue"].label("revenue"),
            expressions["order_count"].label("order_count"),
            expressions["revenue_lost"].label("revenue_lost"),
        )

    @staticmethod
    def _sort_column(
        sort_by: str | None,
        is_ascending: bool | None,
        expressions: dict[str, Any],
    ) -> Any:
        columns = {
            "startAt": SaleModel.start_at,
            "endAt": SaleModel.end_at,
            "discountPerc": SaleModel.discount_perc,
            "duration": expressions["duration"],
            "revenue": expressions["revenue"],
            "orderCount": expressions["order_count"],
            "revenueLost": expressions["revenue_lost"],
        }
        if sort_by is not None and sort_by not in columns:
            raise ValueError(f"Unsupported sale sort: {sort_by}")

        column = columns.get(sort_by, SaleModel.start_at)
        return column.asc() if is_ascending else desc(column)
