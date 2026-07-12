import pytest
from pydantic import BaseModel, EmailStr

from app.core.exceptions import (
    ContentNotFoundException
)
from app.db.models import Product, Rarity, Stock, Category

from app.features.shop.shop_schemas import (
    ProductDetail,
    SortBy,
    PostProductsSearchRequest
)

from app.features.shop.shop_service import (
    get_category_names,
    get_rarity_names,
    get_sales,
    active_sale_subquery,
    product_query,
    get_product_by_slug,
    apply_product_filters,
    apply_product_search,
    apply_product_sorting,
    apply_pagination,
    search_products,
)

class get_category_names_test:
    def functionality_test(_, session, category):
        db_categories = get_category_names(session)
        assert db_categories == [category.name]
    
class get_rarity_names_test:
    def functionality_test(_, session, rarity):
        db_rarities = get_rarity_names(session)
        assert db_rarities == [rarity.name]
    
class get_sales_test:
    def functionality_test(_, session, sale):
        db_sales = get_sales(session)
        assert db_sales == [sale]
    
class active_sale_subquery_test:
    def functionality_test(_, session, sale):
        subquery = active_sale_subquery(session)
        results = session.query(subquery).all()
        
        assert results
        assert results[0][0] == sale.products[0].id
        assert results[0][1] == sale.slug
        assert results[0][2] == 1

class product_query_test:
    def functionality_test(_, session, product, sale):
        query = product_query(session)
        results = query.all()
        assert results
        assert len(results) > 0
        assert results[0][0] == product
        assert results[0][1] == sale.slug
    
class get_product_by_slug_test:
    def functionality_test(_, session, category, rarity, product, stock, sale):
        product_detail = get_product_by_slug(session, product.slug)
        assert isinstance(product_detail, ProductDetail)
        assert product_detail.name == product.name
        assert product_detail.category_name == category.name
        assert product_detail.rarity_name == rarity.name
        assert product_detail.stock == stock.current
        assert product_detail.sale_slug == sale.slug
    
    def missing_product_test(_, session, seed):
        with pytest.raises(ContentNotFoundException):
            get_product_by_slug(session, 'Not a Slug')

    def no_stock_row_test(_, session, product):
        product_detail = get_product_by_slug(session, product.slug)
        assert product_detail.stock == 0

class apply_product_filters_test:
    def functionality_test(_, session, seed, category, rarity):
        query = product_query(session)
        query = apply_product_filters(
            query, 
            categories=[category.name], 
            rarities=[rarity.name],
        )
        results = query.all()
        assert len(results) > 0
        assert next(
            (x for x in results if x[0].category.name != category.name), None
        )  is None
        assert next(
            (x for x in results if x[0].rarity.name != rarity.name), None
        )  is None
        assert next((x for x in results if x[0].discontinued_at), None)  is None
        assert next((x for x in results if x[0].stock.current < 1), None)  is None

    def empty_list_allows_all_test(_, session, seed):
        query = product_query(session)
        query = apply_product_filters(
            query, 
            categories=[], 
            rarities=[],
        )
        results = query.all()
        assert len(results) > 0

    def allows_discontinued_stock_test(_, session, seed):
        query = product_query(session)
        query = apply_product_filters(
            query, 
            is_discontinued=True, 
            is_stock=False,
        )
        results = query.all()
        assert next((True for x in results if x[0].discontinued_at), False)
        assert next((True for x in results if x[0].stock.current < 1), False)
    
class apply_product_search_test:
    def functionality_test(_, session, product, seed):
        query = product_query(session)
        query = apply_product_search(
            query, 
            search=product.name
        )
        results = query.all()
        assert len(results) == 1
        assert next((x for x in results if x[0].name != product.name), None)  is None
    
    def none_allows_all_test(_, session, seed):
        query = product_query(session)
        query = apply_product_search(
            query, 
            search=None
        )
        results = query.all()
        assert len(results) > 1

class apply_product_sorting_test:
    def functionality_test(_, session, seed):
        query = product_query(session)
        query = apply_product_sorting(
            query, 
        )
        results = query.all()
        assert results
        assert results[0][0].units_sold > results[1][0].units_sold
    
    def ascending_order_test(_, session, seed):
        query = product_query(session)
        query = apply_product_sorting(
            query, 
            is_ascending=True
        )
        results = query.all()
        assert results
        assert results[0][0].units_sold < results[1][0].units_sold
    
class apply_pagination_test:
    def functionality_test(_, session, seed):
        query = product_query(session)
        results = apply_pagination(
            query, 
            limit=2, 
            offset=2
        )
        assert results
        db_products, has_more = results

        assert len(db_products) == 2
        assert has_more

    def none_limit_offest_test(_, session, seed):
        query = product_query(session)
        results = apply_pagination(
            query, 
        )
        assert results
        db_products, has_more = results

        assert len(db_products) == len(seed['products']) + 1
        assert not has_more
    
class search_products_test:
    def functionality_test(
        _, session, category, rarity, product, seed
    ):
        options = PostProductsSearchRequest(        
            categories=[category.name], 
            rarities=[rarity.name],
            sort_by=SortBy.price, 
        )
        results = search_products(session, options)
        assert results
        assert next((x for x in results.products if product), None) is not None

    
