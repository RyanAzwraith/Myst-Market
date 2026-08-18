import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.admin.admin_products_service import (
    _category,
    _rarity,
    create_product,
    delete_product,
    get_product_analytics,
    patch_product,
    patch_products,
    search_products,
)
from app.features.admin.admin_schema import (
    PatchProductBulkRequest,
    PatchProductRequest,
    PostProductRequest,
    PostProductSearchRequest,
    ProductSortBy,
)


class get_product_analytics_test:
    def functionality_test(
        self,
        session,
        product,
        stock,
        sale,
        review,
        admin_status_seed,
        order_factory,
    ):
        order = order_factory()
        result = get_product_analytics(session, product.id)

        assert result.id == product.id
        assert result.name == product.name
        assert result.stock == stock.current
        assert result.sale.name == sale.name
        assert result.sale.slug == sale.slug
        assert result.sale.discount_percent == sale.discount_percent
        assert result.units_sold == order.order_products[0].quantity
        assert result.revenue == (
            order.order_products[0].quantity
            * order.order_products[0].unit_price_aud_cent
        )
        assert result.order_count == 1
        assert result.reviews == 1
        assert result.average_rating == review.rating

    def no_metrics_test(self, session, product):
        result = get_product_analytics(session, product.id)

        assert result.units_sold == 0
        assert result.revenue == 0
        assert result.order_count == 0
        assert result.refunds == 0
        assert result.revenue_lost == 0
        assert result.average_rating == 0
        assert result.reviews == 0

    def missing_product_test(self, session):
        with pytest.raises(ContentNotFoundException):
            get_product_analytics(session, 500)


class search_products_test:
    def functionality_test(self, session, product, shop_seed):
        result = search_products(
            session,
            PostProductSearchRequest(search="Sword"),
        )

        assert len(result.products) == 1
        assert result.products[0].id == product.id
        assert not result.has_more

    def category_filter_test(self, session, shop_seed):
        result = search_products(
            session,
            PostProductSearchRequest(categories=["Consumables"]),
        )

        assert result.products
        assert all(
            product.category_name == "Consumables" for product in result.products
        )

    def discontinued_filter_test(self, session, shop_seed):
        result = search_products(
            session,
            PostProductSearchRequest(is_discontinued=True),
        )

        discontinued = shop_seed["products"][-1]
        assert any(product.id == discontinued.id for product in result.products)

    def sorting_test(self, session, shop_seed):
        result = search_products(
            session,
            PostProductSearchRequest(
                sort_by=ProductSortBy.price,
                is_ascending=True,
            ),
        )

        prices = [product.price_aud_cent for product in result.products]
        assert prices == sorted(prices)

    def pagination_test(self, session, shop_seed):
        result = search_products(
            session,
            PostProductSearchRequest(limit=2),
        )

        assert len(result.products) == 2
        assert result.has_more


class _category_test:
    def functionality_test(self, session, category):
        assert _category(session, category.name).id == category.id

    def missing_category_test(self, session):
        with pytest.raises(ContentNotFoundException):
            _category(session, "Missing Category")


class _rarity_test:
    def functionality_test(self, session, rarity):
        assert _rarity(session, rarity.name).id == rarity.id

    def missing_rarity_test(self, session):
        with pytest.raises(ContentNotFoundException):
            _rarity(session, "Missing Rarity")


class create_product_test:
    def functionality_test(self, session, category, rarity):
        request = PostProductRequest(
            name="Created Product",
            category_name=category.name,
            rarity_name=rarity.name,
            price_aud_cent=1000,
            slug="created-product",
            description="Created description",
            stock=4,
        )

        result = create_product(session, request)

        assert result.id is not None
        assert result.name == request.name
        assert result.category.id == category.id
        assert result.rarity.id == rarity.id
        assert result.stock.current == request.stock

    def missing_category_test(self, session, rarity):
        request = PostProductRequest(
            name="Created Product",
            category_name="Missing Category",
            rarity_name=rarity.name,
            price_aud_cent=1000,
            slug="created-product",
            description="Created description",
            stock=4,
        )

        with pytest.raises(ContentNotFoundException):
            create_product(session, request)

    def missing_rarity_test(self, session, category):
        request = PostProductRequest(
            name="Created Product",
            category_name=category.name,
            rarity_name="Missing Rarity",
            price_aud_cent=1000,
            slug="created-product",
            description="Created description",
            stock=4,
        )

        with pytest.raises(ContentNotFoundException):
            create_product(session, request)


class patch_product_test:
    def functionality_test(self, session, product, stock, category, rarity):
        request = PatchProductRequest(
            name="Updated Product",
            category_name=category.name,
            rarity_name=rarity.name,
            price_aud_cent=2000,
            slug="updated-product",
            description="Updated description",
            stock=9,
        )

        patch_product(session, product.id, request)
        session.refresh(product)

        assert product.name == request.name
        assert product.category.id == category.id
        assert product.rarity.id == rarity.id
        assert product.price_aud_cent == request.price_aud_cent
        assert product.slug == request.slug
        assert product.description == request.description
        assert product.stock.current == request.stock

    def missing_product_test(self, session):
        with pytest.raises(ContentNotFoundException):
            patch_product(session, 500, PatchProductRequest(name="Updated"))

    def missing_category_test(self, session, product):
        request = PatchProductRequest(category_name="Missing Category")

        with pytest.raises(ContentNotFoundException):
            patch_product(session, product.id, request)

    def missing_rarity_test(self, session, product):
        request = PatchProductRequest(rarity_name="Missing Rarity")

        with pytest.raises(ContentNotFoundException):
            patch_product(session, product.id, request)


class patch_products_test:
    def functionality_test(self, session, product, shop_seed, category):
        other_product = shop_seed["products"][0]
        request = PatchProductBulkRequest(
            product_ids=[product.id, other_product.id],
            category_name=category.name,
            price_aud_cent=3000,
            stock=7,
        )

        patch_products(session, request)
        session.refresh(product)
        session.refresh(other_product)

        assert product.category.id == category.id
        assert other_product.category.id == category.id
        assert product.price_aud_cent == request.price_aud_cent
        assert other_product.price_aud_cent == request.price_aud_cent
        assert product.stock.current == request.stock
        assert other_product.stock.current == request.stock

    def missing_product_test(self, session, product):
        request = PatchProductBulkRequest(
            product_ids=[product.id, 500],
            price_aud_cent=3000,
        )

        with pytest.raises(ContentNotFoundException):
            patch_products(session, request)


class delete_product_test:
    def functionality_test(self, session, product):
        delete_product(session, product.id)
        session.refresh(product)

        assert product.discontinued_at is not None

    def missing_product_test(self, session):
        with pytest.raises(ContentNotFoundException):
            delete_product(session, 500)
