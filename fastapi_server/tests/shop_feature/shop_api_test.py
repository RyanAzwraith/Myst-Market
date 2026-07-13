import pytest
from pydantic import BaseModel, EmailStr

from app.db.models import User
from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
    ContentNotFoundException
)

from app.features.shop.shop_api import (
    get_categories_route,
    get_rarities_route,
    get_sales_route,
    get_product_by_slug_route,
    post_products_search_route,
)
from app.features.shop.shop_schemas import (
    PostProductsSearchRequest,
    SortBy
)


class get_categories_route_test:
    @pytest.mark.asyncio
    async def functionality_test(_, session, category):
        result = await get_categories_route(session)
        assert len(result.categories)
    
class get_rarities_route_test:
    @pytest.mark.asyncio
    async  def functionality_test(_, session, rarity):
        result = await get_rarities_route(session)
        assert len(result.rarities)
    
class get_sales_route_test:    
    @pytest.mark.asyncio
    async  def functionality_test(_, session, sale):
        result = await get_sales_route(session)
        assert len(result.sales)
    
class get_product_by_slug_route_test:
    @pytest.mark.asyncio
    async  def functionality_test(_, session, product):
        result = await get_product_by_slug_route(product.slug, session)
        assert result.product
    
class post_products_search_route_test:
    @pytest.mark.asyncio
    async  def functionality_test(_, session, seed):
        req = PostProductsSearchRequest( 
            limit=2,
            offest=2,       
        )
        result = await post_products_search_route(req, session)
        assert result.products
        assert result.has_more

    
