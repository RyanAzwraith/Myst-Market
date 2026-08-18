import pytest

from app.core.exceptions import ContentNotFoundException
from app.features.admin.admin_sales_service import (
    create_sale,
    delete_sale,
    get_sale_analytics,
    patch_sale,
    patch_sales,
    search_sales,
)
from app.features.admin.admin_schema import (
    PatchSaleBulkRequest,
    PatchSaleRequest,
    PostSaleRequest,
    PostSaleSearchRequest,
    SaleActivation,
    SaleSortBy,
)


class get_sale_analytics_test:
    def no_orders_test(self, session, sale):
        result = get_sale_analytics(session, sale.id)

        assert result.id == sale.id
        assert result.revenue == 0
        assert result.order_count == 0
        assert result.revenue_lost == 0

    def functionality_test(
        self,
        session,
        sale,
        admin_status_seed,
        order_factory,
    ):
        order = order_factory()
        result = get_sale_analytics(session, sale.id)

        assert result.order_count == 1
        assert result.revenue == order.cost_aud_cent

    def missing_sale_test(self, session):
        with pytest.raises(ContentNotFoundException):
            get_sale_analytics(session, 500)


class search_sales_test:
    def functionality_test(self, session, sale):
        result = search_sales(
            session,
            PostSaleSearchRequest(search=sale.name),
        )

        assert len(result.sales) == 1
        assert result.sales[0].id == sale.id

    def activation_filter_test(self, session, sale):
        result = search_sales(
            session,
            PostSaleSearchRequest(activation=[SaleActivation.active]),
        )

        assert any(item.id == sale.id for item in result.sales)

    def sorting_test(self, session, sale, category, rarity):
        second = create_sale(
            session,
            PostSaleRequest(
                name="Large Discount",
                slug="large-discount",
                description="Large discount",
                discount_percent=50,
                start_at=sale.start_at,
                end_at=sale.end_at,
            ),
        )
        result = search_sales(
            session,
            PostSaleSearchRequest(
                sort_by=SaleSortBy.discount_percent,
                is_ascending=False,
            ),
        )

        assert result.sales[0].id == second.id

    def pagination_test(self, session, sale):
        create_sale(
            session,
            PostSaleRequest(
                name="Second Sale",
                slug="second-sale",
                description="Second sale",
                discount_percent=5,
                start_at=sale.start_at,
                end_at=sale.end_at,
            ),
        )
        result = search_sales(
            session,
            PostSaleSearchRequest(limit=1),
        )

        assert len(result.sales) == 1
        assert result.has_more


class patch_sale_test:
    def functionality_test(self, session, sale):
        request = PatchSaleRequest(
            name="Updated Sale",
            discount_percent=35,
        )
        patch_sale(session, sale.id, request)
        session.refresh(sale)

        assert sale.name == request.name
        assert sale.discount_percent == request.discount_percent

    def missing_sale_test(self, session):
        with pytest.raises(ContentNotFoundException):
            patch_sale(session, 500, PatchSaleRequest(name="Updated"))


class patch_sales_test:
    def functionality_test(self, session, sale, shop_seed):
        second = create_sale(
            session,
            PostSaleRequest(
                name="Second Sale",
                slug="second-sale",
                description="Second sale",
                discount_percent=5,
                start_at=sale.start_at,
                end_at=sale.end_at,
            ),
        )
        request = PatchSaleBulkRequest(
            sale_ids=[sale.id, second.id],
            discount_percent=40,
        )

        patch_sales(session, request)
        session.refresh(sale)
        session.refresh(second)

        assert sale.discount_percent == 40
        assert second.discount_percent == 40

    def missing_sale_test(self, session, sale):
        request = PatchSaleBulkRequest(
            sale_ids=[sale.id, 500],
            discount_percent=40,
        )

        with pytest.raises(ContentNotFoundException):
            patch_sales(session, request)


class create_sale_test:
    def functionality_test(self, session, sale):
        result = create_sale(
            session,
            PostSaleRequest(
                name="Created Sale",
                slug="created-sale",
                description="Created sale",
                discount_percent=15,
                start_at=sale.start_at,
                end_at=sale.end_at,
            ),
        )

        assert result.id is not None
        assert result.name == "Created Sale"


class delete_sale_test:
    def functionality_test(self, session, sale):
        delete_sale(session, sale.id)
        assert session.query(type(sale)).filter_by(id=sale.id).first() is None

    def missing_sale_test(self, session):
        with pytest.raises(ContentNotFoundException):
            delete_sale(session, 500)
