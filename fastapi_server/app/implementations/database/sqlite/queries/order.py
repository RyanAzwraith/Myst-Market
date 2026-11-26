from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from sqlalchemy import Select, and_, case, desc, func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException
from app.features.app.schema import GraphPoint, Performance
from app.features.item.schema import ItemResolution
from app.features.order.schema import Address as AddressSchema
from app.features.order.schema import Order as OrderSchema
from app.features.order.schema import OrderSummary
from app.interfaces.database_schemas.Order import Order as OrderInterface

from ..common import (
    LOST_ORDER_STATUSES,
    SUCCESSFUL_ORDER_STATUSES,
    execute_page,
    get_model,
)
from ..models.address import Address as AddressModel
from ..models.item import Item as ItemModel
from ..models.order import Order as OrderModel
from ..models.product import Product as ProductModel
from ..models.user import User as UserModel


class SqliteOrder(OrderInterface):
    def __init__(self, session: Session):
        self._session = session

    def get(self, order_id: int) -> OrderSchema:
        order = get_model(
            self._session,
            OrderModel,
            "Order",
            order_id,
        )
        return self._to_schema(order)

    def get_all(self, user_id: int | None = None) -> list[OrderSchema]:
        statement = select(OrderModel).order_by(
            OrderModel.created_at.desc(),
            OrderModel.id.desc(),
        )
        if user_id is not None:
            statement = statement.where(OrderModel.user_id == user_id)

        orders = self._session.scalars(statement).all()
        return [self._to_schema(order) for order in orders]

    def get_recent(self, limit: int = 10) -> list[OrderSchema]:
        if limit < 0:
            raise ValueError("limit must be non-negative")
        statement = (
            select(OrderModel)
            .order_by(
                OrderModel.created_at.desc(),
                OrderModel.id.desc(),
            )
            .limit(limit)
        )
        orders = self._session.scalars(statement).all()
        return [self._to_schema(order) for order in orders]

    def search_admin(
        self,
        search_name: str | None = None,
        statuses: list[str] | None = None,
        sort_by: str | None = None,
        is_ascending: bool | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[list[OrderSummary], bool]:
        statement = select(
            OrderModel.id.label("id"),
            OrderModel.created_at.label("created_at"),
            OrderModel.cost_aud_cent.label("total_cent"),
            OrderModel.status.label("status"),
        )

        if search_name:
            statement = statement.join(
                UserModel,
                UserModel.id == OrderModel.user_id,
            ).where(
                or_(
                    UserModel.name.ilike(f"%{search_name}%"),
                    UserModel.email.ilike(f"%{search_name}%"),
                )
            )
        if statuses:
            statement = statement.where(
                OrderModel.status.in_(
                    [self._enum_value(status) for status in statuses]
                )
            )

        sort_column = {
            "createdAt": OrderModel.created_at,
            "cost": OrderModel.cost_aud_cent,
            "status": OrderModel.status,
        }.get(sort_by)
        if sort_by is not None and sort_column is None:
            raise ValueError(f"Unsupported order sort: {sort_by}")
        sort_column = sort_column or OrderModel.created_at
        sort_expression = (
            sort_column.asc()
            if is_ascending
            else desc(sort_column)
        )
        statement = statement.order_by(
            sort_expression,
            OrderModel.id,
        )

        rows, has_more = execute_page(
            self._session,
            statement,
            limit,
            offset or 0,
        )
        return [
            OrderSummary(
                id=row["id"],
                created_at=row["created_at"],
                total_cent=row["total_cent"],
                status=row["status"],
            )
            for row in rows
        ], has_more

    def create_with_items(
        self,
        user_id: int,
        address: AddressSchema,
        items: list[ItemResolution],
        status: str,
        cost_aud_cent: int,
        delivery_note: str | None,
    ) -> OrderSchema:
        get_model(
            self._session,
            UserModel,
            "User",
            user_id,
        )

        address_model = AddressModel(
            user_id=user_id,
            country_code=address.country_code,
            postcode=int(address.postcode),
            state=address.state,
            city=address.city,
            street=address.street,
        )
        order = OrderModel(
            user_id=user_id,
            address=address_model,
            status=self._enum_value(status),
            cost_aud_cent=cost_aud_cent,
            delivery_note=delivery_note,
        )
        order.items = [
            self._to_item_model(item)
            for item in items
        ]
        self._session.add(order)
        self._session.commit()
        self._session.refresh(order)
        return self._to_schema(order)

    def patch_status(self, order_id: int, status: str) -> None:
        order = get_model(
            self._session,
            OrderModel,
            "Order",
            order_id,
        )
        order.status = self._enum_value(status)
        order.updated_at = date.today()
        self._session.commit()

    def patch_statuses(self, order_ids: list[int], status: str) -> None:
        orders = self._session.scalars(
            select(OrderModel).where(OrderModel.id.in_(order_ids))
        ).all()
        found_ids = {order.id for order in orders}
        missing_ids = set(order_ids) - found_ids
        if missing_ids:
            raise ContentNotFoundException(
                "Order Not Found",
                details={"order_ids": sorted(missing_ids)},
            )

        status_value = self._enum_value(status)
        for order in orders:
            order.status = status_value
            order.updated_at = date.today()
        self._session.commit()

    def count_by_status(self, status: str) -> int:
        statement = select(func.count(OrderModel.id)).where(
            OrderModel.status == self._enum_value(status),
        )
        return self._session.scalar(statement) or 0

    def get_performance(self, days: int) -> Performance:
        if days < 0:
            raise ValueError("days must be non-negative")

        end = date.today() + timedelta(days=1)
        current_start = end - timedelta(days=days)
        previous_start = current_start - timedelta(days=days)
        current = self._period_metrics(current_start, end)
        previous = self._period_metrics(previous_start, current_start)
        return Performance(
            period_days=days,
            revenue=current["revenue"],
            orders=current["orders"],
            new_customers=current["new_customers"],
            revenue_lost=current["revenue_lost"],
            previous_revenue=previous["revenue"],
            previous_orders=previous["orders"],
            previous_new_customers=previous["new_customers"],
            previous_revenue_lost=previous["revenue_lost"],
        )

    def get_graph(self, months: int) -> list[GraphPoint]:
        if months < 0:
            raise ValueError("months must be non-negative")

        current_month = date.today().replace(day=1)
        points = []
        for offset in range(months - 1, -1, -1):
            start = self._shift_month(current_month, -offset)
            end = self._shift_month(start, 1)
            metrics = self._period_metrics(start, end)
            points.append(
                GraphPoint(
                    month=start.strftime("%Y-%m"),
                    revenue=metrics["revenue"],
                    orders=metrics["orders"],
                )
            )
        return points

    def _to_schema(self, order: OrderModel) -> OrderSchema:
        return OrderSchema(
            id=order.id,
            user_id=order.user_id,
            address_string=self._address_string(order.address),
            items=[
                self._to_item_resolution(item)
                for item in order.items
            ],
            cost_aud_cent=order.cost_aud_cent,
            created_at=order.created_at,
            status=order.status,
        )

    @staticmethod
    def _to_item_resolution(item: ItemModel) -> ItemResolution:
        product = item.product
        return ItemResolution(
            product={
                "id": product.id,
                "sale_id": item.sale_id,
                "name": product.name,
                "slug": product.slug,
            },
            quantity=item.quantity,
            unit_price_cent=item.unit_price_aud_cent,
            line_total_cent=(
                item.quantity * item.unit_price_aud_cent
            ),
            on_sale=item.sale_id is not None,
            warning=None,
        )

    @staticmethod
    def _to_item_model(item: ItemResolution) -> ItemModel:
        product = item.product
        return ItemModel(
            product_id=product.id,
            sale_id=product.sale_id,
            quantity=item.quantity,
            unit_price_aud_cent=item.unit_price_cent,
        )

    @staticmethod
    def _address_string(address: AddressModel) -> str:
        return (
            f"{address.street}, {address.city}, {address.state}, "
            f"{address.postcode}, {address.country_code}"
        )

    def _period_metrics(
        self,
        start: date,
        end: date,
    ) -> dict[str, int]:
        valid = OrderModel.status.in_(SUCCESSFUL_ORDER_STATUSES)
        lost = OrderModel.status.in_(LOST_ORDER_STATUSES)
        statement = (
            select(
                func.coalesce(
                    func.sum(case((valid, OrderModel.cost_aud_cent), else_=0)),
                    0,
                ).label("revenue"),
                func.count(case((valid, OrderModel.id))).label("orders"),
                func.count(
                    func.distinct(
                        case(
                            (
                                and_(
                                    valid,
                                    UserModel.created_at >= start,
                                    UserModel.created_at < end,
                                ),
                                UserModel.id,
                            )
                        )
                    )
                ).label("new_customers"),
                func.coalesce(
                    func.sum(case((lost, OrderModel.cost_aud_cent), else_=0)),
                    0,
                ).label("revenue_lost"),
            )
            .select_from(OrderModel)
            .join(
                UserModel,
                UserModel.id == OrderModel.user_id,
            )
            .where(
                OrderModel.created_at >= start,
                OrderModel.created_at < end,
            )
        )
        row = self._session.execute(statement).mappings().one()
        return {
            key: int(row[key] or 0)
            for key in (
                "revenue",
                "orders",
                "new_customers",
                "revenue_lost",
            )
        }

    @staticmethod
    def _shift_month(value: date, offset: int) -> date:
        month = value.month - 1 + offset
        year = value.year + month // 12
        month = month % 12 + 1
        return value.replace(year=year, month=month, day=1)

    @staticmethod
    def _enum_value(value: Any) -> str:
        return getattr(value, "value", value)
