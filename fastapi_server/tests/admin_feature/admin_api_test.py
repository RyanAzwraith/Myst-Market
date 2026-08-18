import pytest

from app.features.admin.admin_api import (
    get_product_analytics_route,
    get_sale_analytics_route,
    get_user_analytics_route,
    post_product_search_route,
    post_sale_search_route,
    post_user_search_route,
)
from app.features.admin.admin_schema import (
    PostProductSearchRequest,
    PostSaleSearchRequest,
    PostUserSearchRequest,
)


class get_user_analytics_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        result = await get_user_analytics_route(user.id, session)

        assert result.user.id == user.id


class post_user_search_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, user):
        result = await post_user_search_route(
            PostUserSearchRequest(search=user.email),
            session,
        )

        assert len(result.users) == 1


class get_sale_analytics_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, sale):
        result = await get_sale_analytics_route(sale.id, session)

        assert result.sale.id == sale.id


class post_sale_search_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, sale):
        result = await post_sale_search_route(
            PostSaleSearchRequest(search=sale.name),
            session,
        )

        assert len(result.sales) == 1


class get_product_analytics_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, product):
        result = await get_product_analytics_route(product.id, session)

        assert result.product.id == product.id


class post_product_search_route_test:
    @pytest.mark.asyncio
    async def functionality_test(self, session, product):
        result = await post_product_search_route(
            PostProductSearchRequest(search=product.name),
            session,
        )

        assert len(result.products) == 1
