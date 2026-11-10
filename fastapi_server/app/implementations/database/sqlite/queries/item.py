from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import Integer, Select, and_, case, cast, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ContentNotFoundException
from app.features.item.schema import ItemResolution, ItemSummary
from app.interfaces.database_schemas.Item import Item as ItemInterface

from ..models.association_tables import sale_product
from ..models.product import Product as ProductModel
from ..models.sale import Sale as SaleModel
from ..models.stock import Stock as StockModel


class SqliteItem(ItemInterface):
    def __init__(self, session: Session):
        self._session = session

    def resolve(
        self,
        items: list[ItemSummary],
    ) -> tuple[list[ItemResolution], int]:
        self._validate_quantities(items)
        if not items:
            return [], 0

        product_ids = {item.product_id for item in items}
        statement = self._resolution_statement().where(
            ProductModel.id.in_(product_ids),
        )
        rows = self._session.execute(statement).mappings().all()
        products = {row["id"]: row for row in rows}

        missing_ids = product_ids - products.keys()
        if missing_ids:
            missing_id = min(missing_ids)
            raise ContentNotFoundException(
                "Product Not Found",
                details={"product_id": missing_id},
            )

        resolved_items = [
            self._resolve_item(item, products[item.product_id])
            for item in items
        ]
        total_cent = sum(
            item.line_total_cent
            for item in resolved_items
        )
        return resolved_items, total_cent

    @staticmethod
    def _resolution_statement() -> Select[Any]:
        active_sale = (
            select(
                sale_product.c.product_id.label("product_id"),
                SaleModel.id.label("sale_id"),
                func.row_number().over(
                    partition_by=sale_product.c.product_id,
                    order_by=(
                        SaleModel.discount_perc.desc(),
                        SaleModel.id,
                    ),
                ).label("sale_rank"),
                SaleModel.discount_perc.label("discount_perc"),
            )
            .join(
                SaleModel,
                SaleModel.id == sale_product.c.sale_id,
            )
            .where(
                SaleModel.start_at <= date.today(),
                SaleModel.end_at >= date.today(),
            )
            .subquery()
        )
        unit_price = case(
            (
                active_sale.c.discount_perc.is_not(None),
                cast(
                    func.round(
                        ProductModel.price_aud_cent
                        * (100 - active_sale.c.discount_perc)
                        / 100
                    ),
                    Integer,
                ),
            ),
            else_=ProductModel.price_aud_cent,
        )
        return (
            select(
                ProductModel.id.label("id"),
                ProductModel.name.label("name"),
                ProductModel.slug.label("slug"),
                ProductModel.discontinued_at.label("discontinued_at"),
                func.coalesce(StockModel.current, 0).label("stock"),
                active_sale.c.sale_id.label("sale_id"),
                unit_price.label("unit_price_cent"),
            )
            .outerjoin(
                StockModel,
                StockModel.product_id == ProductModel.id,
            )
            .outerjoin(
                active_sale,
                and_(
                    active_sale.c.product_id == ProductModel.id,
                    active_sale.c.sale_rank == 1,
                ),
            )
        )

    @staticmethod
    def _validate_quantities(items: list[ItemSummary]) -> None:
        for item in items:
            if item.quantity <= 0:
                raise ValueError(
                    "Item quantity must be greater than zero"
                )

    @staticmethod
    def _resolve_item(
        item: ItemSummary,
        row: Any,
    ) -> ItemResolution:
        warning = None
        if row["discontinued_at"] is not None:
            warning = "Product is discontinued"
        elif row["stock"] <= 0:
            warning = "Product is out of stock"
        elif item.quantity > row["stock"]:
            warning = f"Only {row['stock']} in stock"

        unit_price = row["unit_price_cent"]
        return ItemResolution(
            product={
                "id": row["id"],
                "sale_id": row["sale_id"],
                "name": row["name"],
                "slug": row["slug"],
            },
            quantity=item.quantity,
            unit_price_cent=unit_price,
            line_total_cent=unit_price * item.quantity,
            on_sale=row["sale_id"] is not None,
            warning=warning,
        )
