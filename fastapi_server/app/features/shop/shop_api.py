from fastapi import APIRouter, Depends

from app.api.dependencies import (
    get_session
)

from .shop_service import (
    get_category_names,
    get_rarity_names,
    get_sale_by_slug,
    get_product_by_slug,
    search_products,
)
from .shop_schemas import (
    GetCategoriesResponse,
    GetRaritiesResponse,
    GetSaleBySlugResponse,
    GetProductBySlugResponse,
        PostProductsSearchRequest,
    PostProductsSearchResponse,
)

router = APIRouter()
# GET /categories
# GET /rarities
# GET /sales
# GET /product/{product_slug}
# POST /products/search

@router.get(
    "/categories", 
    status_code=200, 
    response_model=GetCategoriesResponse
)
async def get_categories_route(session=Depends(get_session)):
    db_categories = get_category_names(session)
    return GetCategoriesResponse( categories= db_categories )


@router.get(
    "/rarities", 
    status_code=200, 
    response_model=GetRaritiesResponse
)
async def get_rarities_route(session=Depends(get_session)):
    db_rarities = get_rarity_names(session)
    return GetRaritiesResponse( rarities= db_rarities )


@router.get(
    "/sale/{sale_slug}", 
    status_code=200, 
    response_model=GetSaleBySlugResponse
)
async def get_sale_by_slug_route(
    sale_slug:str, 
    session=Depends(get_session)
):
    db_sale = get_sale_by_slug(session, sale_slug)
    return GetSaleBySlugResponse( sale=db_sale )


@router.get(
    "/product/{product_slug}", 
    status_code=200, 
    response_model=GetProductBySlugResponse
)
async def get_product_by_slug_route(
    product_slug:str, 
    session=Depends(get_session)
):
    db_product = get_product_by_slug(session, product_slug)
    return GetProductBySlugResponse( product= db_product )

@router.post(
    "/products/search", 
    status_code=200, 
    response_model=PostProductsSearchResponse
)
async def post_products_search_route(
    req: PostProductsSearchRequest, 
    session=Depends(get_session)
):
    products_search = search_products(session, req)
    return PostProductsSearchResponse(
        products= products_search.products,
        has_more= products_search.has_more
    )

