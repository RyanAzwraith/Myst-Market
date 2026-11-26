from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import (
    Integer,
    Select,
    and_,
    case,
    cast,
    desc,
    func,
    or_,
    select,
)
from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    ContentNotFoundException,
)
from app.features.product.schema import Product as ProductSchema
from app.features.product.schema import ProductAnalytics
from app.features.sale.schema import SaleSummary
from app.interfaces.database_schemas.Product import Product as ProductInterface

from ..common import (
    LOST_ORDER_STATUSES,
    SUCCESSFUL_ORDER_STATUSES,
    execute_page,
    get_model,
    validate_pagination,
)
from ..models.association_tables import sale_product
from ..models.item import Item as ItemModel
from ..models.order import Order as OrderModel
from ..models.product import Product as ProductModel
from ..models.review import Review as ReviewModel
from ..models.sale import Sale as SaleModel
from ..models.stock import Stock as StockModel


class SqliteProduct(ProductInterface):
    def __init__(self, session: Session):
        self._session = session

    def get_by_slug(self, slug: str) -> ProductSchema:
        statement, _ = self._product_statement()
        row = self._session.execute(
            statement.where(ProductModel.slug == slug)
        ).mappings().first()
        if row is None:
            raise ContentNotFoundException(
                "Product Not Found",
                details={"product_slug": slug},
            )
        return self._to_product(row)

    def get_analytics(self, product_id: int) -> ProductAnalytics:
        statement, expressions = self._product_statement()
        row = self._session.execute(
            statement.where(ProductModel.id == product_id)
        ).mappings().first()
        if row is None:
            get_model(
                self._session,
                ProductModel,
                "Product",
                product_id,
            )
        return self._to_analytics(row, expressions)

    def get_featured(self, limit: int) -> list[ProductSchema]:
        validate_pagination(limit, 0)
        statement, expressions = self._product_statement()
        statement = statement.where(
            expressions["sale_id"].is_not(None),
            expressions["reviews"] > 3,
            ProductModel.discontinued_at.is_(None),
            StockModel.current > 0,
        ).order_by(
            expressions["average_rating"].desc(),
            expressions["reviews"].desc(),
            ProductModel.id,
        ).limit(limit)
        rows = list(self._session.execute(statement).mappings())
        if not rows:
            return self.get_newest(limit)
        return [self._to_product(row) for row in rows]

    def get_popular(self, limit: int) -> list[ProductSchema]:
        validate_pagination(limit, 0)
        statement, expressions = self._product_statement()
        statement = self._available_statement(statement).order_by(
            expressions["units_sold"].desc(),
            ProductModel.id,
        ).limit(limit)
        rows = self._session.execute(statement).mappings()
        return [self._to_product(row) for row in rows]

    def get_newest(self, limit: int) -> list[ProductSchema]:
        validate_pagination(limit, 0)
        statement, _ = self._product_statement()
        statement = self._available_statement(statement).order_by(
            ProductModel.created_at.desc(),
            ProductModel.id.desc(),
        ).limit(limit)
        rows = self._session.execute(statement).mappings()
        return [self._to_product(row) for row in rows]

    def get_most_sold(self, limit: int) -> list[ProductAnalytics]:
        validate_pagination(limit, 0)
        statement, expressions = self._product_statement()
        statement = self._available_statement(statement).order_by(
            expressions["units_sold"].desc(),
            ProductModel.id,
        ).limit(limit)
        rows = self._session.execute(statement).mappings()
        return [
            self._to_analytics(row, expressions)
            for row in rows
        ]

    def search(
        self,
        categories: list[str] | None = None,
        rarities: list[str] | None = None,
        search: str | None = None,
        is_discontinued: bool | None = None,
        sort: str | None = None,
        is_ascending: bool | None = None,
        offset: int | None = None,
        limit: int | None = None,
    ) -> tuple[list[ProductSchema], bool]:
        statement, expressions = self._product_statement()
        statement = self._apply_filters(
            statement,
            categories,
            rarities,
            search,
            is_discontinued,
            include_stock=True,
        )
        statement = statement.order_by(
            self._public_sort_column(
                sort,
                is_ascending,
                expressions,
            ),
            ProductModel.id,
        )
        rows, has_more = execute_page(
            self._session,
            statement,
            limit,
            offset or 0,
        )
        return [self._to_product(row) for row in rows], has_more

    def search_admin(
        self,
        categories: list[str] | None = None,
        rarities: list[str] | None = None,
        search: str | None = None,
        is_discontinued: bool | None = None,
        sort: str | None = None,
        is_ascending: bool | None = None,
        offset: int | None = None,
        limit: int | None = None,
    ) -> tuple[list[ProductAnalytics], bool]:
        statement, expressions = self._product_statement()
        statement = self._apply_filters(
            statement,
            categories,
            rarities,
            search,
            is_discontinued,
            include_stock=False,
        )
        statement = statement.order_by(
            self._admin_sort_column(
                sort,
                is_ascending,
                expressions,
            ),
            ProductModel.id,
        )
        rows, has_more = execute_page(
            self._session,
            statement,
            limit,
            offset or 0,
        )
        return [
            self._to_analytics(row, expressions)
            for row in rows
        ], has_more

    def create(
        self,
        name: str,
        category: str,
        rarity: str,
        price_aud_cent: int,
        slug: str,
        description: str | None,
        stock: int,
    ) -> ProductSchema:
        self._ensure_slug_available(slug)
        product = ProductModel(
            name=name,
            category=category,
            rarity=rarity,
            price_aud_cent=price_aud_cent,
            slug=slug,
            description=description,
            stock=StockModel(current=stock),
        )
        self._session.add(product)
        self._session.commit()
        self._session.refresh(product)
        return self._to_product_model(product)

    def patch(
        self,
        product_id: int,
        name: str | None = None,
        category: str | None = None,
        rarity: str | None = None,
        price_aud_cent: int | None = None,
        slug: str | None = None,
        description: str | None = None,
        stock: int | None = None,
    ) -> ProductSchema:
        product = get_model(
            self._session,
            ProductModel,
            "Product",
            product_id,
        )
        if slug is not None and slug != product.slug:
            self._ensure_slug_available(slug, product_id)

        updates = {
            "name": name,
            "category": category,
            "rarity": rarity,
            "price_aud_cent": price_aud_cent,
            "slug": slug,
            "description": description,
        }
        for field, value in updates.items():
            if value is not None:
                setattr(product, field, value)
        if stock is not None:
            self._set_stock(product, stock)

        self._session.commit()
        self._session.refresh(product)
        return self._to_product_model(product)

    def patch_many(
        self,
        product_ids: list[int],
        category: str | None = None,
        rarity: str | None = None,
        price_aud_cent: int | None = None,
        stock: int | None = None,
    ) -> None:
        products = self._session.scalars(
            select(ProductModel).where(ProductModel.id.in_(product_ids))
        ).all()
        found_ids = {product.id for product in products}
        missing_ids = set(product_ids) - found_ids
        if missing_ids:
            missing_id = min(missing_ids)
            raise ContentNotFoundException(
                "Product Not Found",
                details={"product_id": missing_id},
            )

        updates = {
            "category": category,
            "rarity": rarity,
            "price_aud_cent": price_aud_cent,
        }
        for product in products:
            for field, value in updates.items():
                if value is not None:
                    setattr(product, field, value)
            if stock is not None:
                self._set_stock(product, stock)
        self._session.commit()

    def delete(self, product_id: int) -> None:
        product = get_model(
            self._session,
            ProductModel,
            "Product",
            product_id,
        )
        product.discontinued_at = date.today()
        self._session.commit()

    def count(self, include_discontinued: bool = False) -> int:
        statement = select(func.count(ProductModel.id))
        if not include_discontinued:
            statement = statement.where(ProductModel.discontinued_at.is_(None))
        return self._session.scalar(statement) or 0

    def count_out_of_stock(self) -> int:
        statement = (
            select(func.count(ProductModel.id))
            .outerjoin(
                StockModel,
                StockModel.product_id == ProductModel.id,
            )
            .where(
                ProductModel.discontinued_at.is_(None),
                or_(
                    StockModel.product_id.is_(None),
                    StockModel.current <= 0,
                ),
            )
        )
        return self._session.scalar(statement) or 0

    @staticmethod
    def _active_sale_subquery() -> Any:
        return (
            select(
                sale_product.c.product_id.label("product_id"),
                SaleModel.id.label("sale_id"),
                SaleModel.name.label("sale_name"),
                SaleModel.slug.label("sale_slug"),
                SaleModel.discount_perc.label("discount_perc"),
                func.row_number().over(
                    partition_by=sale_product.c.product_id,
                    order_by=(
                        SaleModel.discount_perc.desc(),
                        SaleModel.id,
                    ),
                ).label("sale_rank"),
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

    @classmethod
    def _product_statement(
        cls,
    ) -> tuple[Select[Any], dict[str, Any]]:
        active_sale = cls._active_sale_subquery()
        expressions = cls._analytics_expressions()
        expressions["sale_id"] = active_sale.c.sale_id
        discounted_price = case(
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
        statement = (
            select(
                ProductModel.id.label("id"),
                ProductModel.name.label("name"),
                ProductModel.category.label("category_name"),
                ProductModel.rarity.label("rarity_name"),
                ProductModel.price_aud_cent.label("price_aud_cent"),
                ProductModel.slug.label("slug"),
                ProductModel.description.label("description"),
                func.coalesce(StockModel.current, 0).label("stock"),
                discounted_price.label("discounted_price"),
                active_sale.c.sale_id.label("sale_id"),
                active_sale.c.sale_name.label("sale_name"),
                active_sale.c.sale_slug.label("sale_slug"),
                active_sale.c.discount_perc.label("sale_discount_perc"),
                ProductModel.discontinued_at.label("discontinued_at"),
                ProductModel.created_at.label("created_at"),
                ProductModel.units_sold.label("stored_units_sold"),
                expressions["units_sold"].label("units_sold"),
                expressions["revenue"].label("revenue"),
                expressions["order_count"].label("order_count"),
                expressions["refunds"].label("refunds"),
                expressions["revenue_lost"].label("revenue_lost"),
                expressions["average_rating"].label("average_rating"),
                expressions["reviews"].label("reviews"),
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
        return statement, expressions

    @staticmethod
    def _analytics_expressions() -> dict[str, Any]:
        line_total = ItemModel.quantity * ItemModel.unit_price_aud_cent
        valid_order = OrderModel.status.in_(SUCCESSFUL_ORDER_STATUSES)
        lost_order = OrderModel.status.in_(LOST_ORDER_STATUSES)
        order_join = OrderModel.id == ItemModel.order_id

        units_sold = (
            select(
                func.coalesce(
                    func.sum(
                        case((valid_order, ItemModel.quantity), else_=0)
                    ),
                    0,
                )
            )
            .select_from(ItemModel)
            .join(OrderModel, order_join)
            .where(ItemModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        revenue = (
            select(
                func.coalesce(
                    func.sum(case((valid_order, line_total), else_=0)),
                    0,
                )
            )
            .select_from(ItemModel)
            .join(OrderModel, order_join)
            .where(ItemModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        order_count = (
            select(
                func.count(
                    func.distinct(
                        case((valid_order, OrderModel.id))
                    )
                )
            )
            .select_from(ItemModel)
            .join(OrderModel, order_join)
            .where(ItemModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        refunds = (
            select(
                func.count(
                    func.distinct(
                        case((lost_order, OrderModel.id))
                    )
                )
            )
            .select_from(ItemModel)
            .join(OrderModel, order_join)
            .where(ItemModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        revenue_lost = (
            select(
                func.coalesce(
                    func.sum(case((lost_order, line_total), else_=0)),
                    0,
                )
            )
            .select_from(ItemModel)
            .join(OrderModel, order_join)
            .where(ItemModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        average_rating = (
            select(
                func.coalesce(func.avg(ReviewModel.rating), 0)
            )
            .where(ReviewModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        reviews = (
            select(func.count(ReviewModel.id))
            .where(ReviewModel.product_id == ProductModel.id)
            .correlate(ProductModel)
            .scalar_subquery()
        )
        return {
            "units_sold": units_sold,
            "revenue": revenue,
            "order_count": order_count,
            "refunds": refunds,
            "revenue_lost": revenue_lost,
            "average_rating": average_rating,
            "reviews": reviews,
        }

    @staticmethod
    def _apply_filters(
        statement: Select[Any],
        categories: list[str] | None,
        rarities: list[str] | None,
        search: str | None,
        is_discontinued: bool | None,
        include_stock: bool,
    ) -> Select[Any]:
        if categories:
            statement = statement.where(
                ProductModel.category.in_(categories)
            )
        if rarities:
            statement = statement.where(
                ProductModel.rarity.in_(rarities)
            )
        if search:
            statement = statement.where(
                ProductModel.name.ilike(f"%{search}%")
            )
        if is_discontinued is True:
            statement = statement.where(
                ProductModel.discontinued_at.is_not(None)
            )
        elif is_discontinued is False or include_stock:
            statement = statement.where(
                ProductModel.discontinued_at.is_(None)
            )
        if include_stock:
            statement = statement.where(StockModel.current > 0)
        return statement

    @staticmethod
    def _available_statement(
        statement: Select[Any],
    ) -> Select[Any]:
        return statement.where(
            ProductModel.discontinued_at.is_(None),
            StockModel.current > 0,
        )

    @staticmethod
    def _public_sort_column(
        sort: str | None,
        is_ascending: bool | None,
        expressions: dict[str, Any],
    ) -> Any:
        columns = {
            "popularity": expressions["units_sold"],
            "price": ProductModel.price_aud_cent,
            "alphabet": ProductModel.name,
            "newest": ProductModel.created_at,
            "rarity": SqliteProduct._rarity_column(),
        }
        if sort is not None and sort not in columns:
            raise ValueError(f"Unsupported product sort: {sort}")
        column = columns.get(sort, columns["popularity"])
        return column.asc() if is_ascending is not False else desc(column)

    @staticmethod
    def _admin_sort_column(
        sort: str | None,
        is_ascending: bool | None,
        expressions: dict[str, Any],
    ) -> Any:
        columns = {
            "price": ProductModel.price_aud_cent,
            "alphabet": ProductModel.name,
            "newest": ProductModel.created_at,
            "rarity": SqliteProduct._rarity_column(),
            "quantitySold": expressions["units_sold"],
            "revenue": expressions["revenue"],
            "orderCount": expressions["order_count"],
            "refunds": expressions["refunds"],
            "revenueLost": expressions["revenue_lost"],
            "averageRating": expressions["average_rating"],
            "reviews": expressions["reviews"],
            "onSale": expressions["sale_id"],
        }
        if sort is not None and sort not in columns:
            raise ValueError(f"Unsupported product admin sort: {sort}")
        column = columns.get(sort, columns["newest"])
        return column.asc() if is_ascending else desc(column)

    @staticmethod
    def _rarity_column() -> Any:
        return case(
            (ProductModel.rarity == "common", 1),
            (ProductModel.rarity == "uncommon", 2),
            (ProductModel.rarity == "rare", 3),
            (ProductModel.rarity == "epic", 4),
            (ProductModel.rarity == "legendary", 5),
            else_=0,
        )

    def _ensure_slug_available(
        self,
        slug: str,
        product_id: int | None = None,
    ) -> None:
        statement = select(ProductModel).where(ProductModel.slug == slug)
        if product_id is not None:
            statement = statement.where(ProductModel.id != product_id)
        if self._session.scalar(statement) is not None:
            raise ConflictException(
                "Product with slug already exists",
                details={"product_slug": slug},
            )

    @staticmethod
    def _set_stock(product: ProductModel, stock: int) -> None:
        if product.stock is None:
            product.stock = StockModel(current=stock)
        else:
            product.stock.current = stock

    @staticmethod
    def _to_product_model(product: ProductModel) -> ProductSchema:
        return ProductSchema(
            id=product.id,
            name=product.name,
            category_name=product.category,
            rarity_name=product.rarity,
            price_aud_cent=product.price_aud_cent,
            slug=product.slug,
            description=product.description or "",
            stock=product.stock.current if product.stock else 0,
            discounted_price=product.price_aud_cent,
            sale=None,
        )

    @staticmethod
    def _to_product(row: Any) -> ProductSchema:
        sale = None
        if row["sale_id"] is not None:
            sale = SaleSummary(
                name=row["sale_name"],
                slug=row["sale_slug"],
                discount_perc=row["sale_discount_perc"],
            )
        return ProductSchema(
            id=row["id"],
            name=row["name"],
            category_name=row["category_name"],
            rarity_name=row["rarity_name"],
            price_aud_cent=row["price_aud_cent"],
            slug=row["slug"],
            description=row["description"] or "",
            stock=row["stock"],
            discounted_price=row["discounted_price"],
            sale=sale,
        )

    @staticmethod
    def _to_analytics(
        row: Any,
        expressions: dict[str, Any],
    ) -> ProductAnalytics:
        return ProductAnalytics(
            id=row["id"],
            name=row["name"],
            category_name=row["category_name"],
            rarity_name=row["rarity_name"],
            price_aud_cent=row["price_aud_cent"],
            slug=row["slug"],
            description=row["description"] or "",
            stock=row["stock"],
            discounted_price=row["discounted_price"],
            sale=(
                SaleSummary(
                    name=row["sale_name"],
                    slug=row["sale_slug"],
                    discount_perc=row["sale_discount_perc"],
                )
                if row["sale_id"] is not None
                else None
            ),
            discontinued_at=row["discontinued_at"],
            created_at=row["created_at"],
            units_sold=row["units_sold"],
            revenue=row["revenue"],
            order_count=row["order_count"],
            refunds=row["refunds"],
            revenue_lost=row["revenue_lost"],
            average_rating=row["average_rating"],
            reviews=row["reviews"],
        )
