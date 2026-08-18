from fastapi import APIRouter, Depends

from app.api.dependencies import get_admin_user, get_session

from .admin_schema import (
    GetOrderUserResponse,
    GetProductAnalyticsResponse,
    GetSaleAnalyticsResponse,
    GetUserAnalyticsResponse,
    PatchOrderBulkRequest,
    PatchOrderStatusRequest,
    PatchProductBulkRequest,
    PatchProductRequest,
    PatchSaleBulkRequest,
    PatchSaleRequest,
    PostOrdersSearchRequest,
    PostProductRequest,
    PostProductSearchRequest,
    PostSaleRequest,
    PostSaleSearchRequest,
    PostUserSearchRequest,
    PostOrdersSearchResponse,
    PostProductSearchResponse,
    PostSaleSearchResponse,
    PostUserSearchResponse,
    PerformanceAnalytics,
    AttentionAnalytics,
    GraphAnalytics,
)
from .admin_users_service import (
    get_user_analytics,
    search_users,
)
from .admin_sales_service import (
    get_sale_analytics,
    search_sales,
    patch_sale,
    patch_sales,
    create_sale,
    delete_sale,
)
from .admin_products_service import (
    get_product_analytics,
    search_products,
    create_product,
    patch_product,
    patch_products,
    delete_product,
)
from .admin_orders_service import (
    get_order_user,
    search_orders,
    patch_order_status,
    patch_orders_status,
)
from .admin_dashboard_service import (
    get_performance,
    get_attention,
    get_graph,
)

router = APIRouter(dependencies=[Depends(get_admin_user)])

# User Routes
@router.get(
    "/users/{user_id}/analytics",
    status_code=200,
    response_model=GetUserAnalyticsResponse,
)
async def get_user_analytics_route(user_id: int, session=Depends(get_session)):
    user = get_user_analytics(session, user_id)
    return GetUserAnalyticsResponse(user=user)


@router.post(
    "/users/search",
    status_code=200,
    response_model=PostUserSearchResponse,
)
async def post_user_search_route(
    req: PostUserSearchRequest,
    session=Depends(get_session),
):
    res = search_users(session, req)
    return PostUserSearchResponse(
        users=res.users,
        has_more=res.has_more,
    )

# Sale Routes
@router.get(
    "/sales/{sale_id}/analytics",
    status_code=200,
    response_model=GetSaleAnalyticsResponse,
)
async def get_sale_analytics_route(sale_id: int, session=Depends(get_session)):
    sale = get_sale_analytics(session, sale_id)
    return GetSaleAnalyticsResponse(sale=sale)


@router.post(
    "/sales/search",
    status_code=200,
    response_model=PostSaleSearchResponse,
)
async def post_sale_search_route(
    req: PostSaleSearchRequest,
    session=Depends(get_session),
):
    sales = search_sales(session, req)
    return PostSaleSearchResponse(
        sales=sales.sales,
        has_more=sales.has_more,
    )


@router.patch("/sales/{sale_id}", status_code=204)
async def patch_sale_route(
    sale_id: int,
    req: PatchSaleRequest,
    session=Depends(get_session),
):
    patch_sale(session, sale_id, req)


@router.patch("/sales", status_code=204)
async def patch_sales_route(
    req: PatchSaleBulkRequest,
    session=Depends(get_session),
):
    patch_sales(session, req)


@router.post("/sales", status_code=201)
async def post_sale_route(
    req: PostSaleRequest,
    session=Depends(get_session),
):
    create_sale(session, req)


@router.delete("/sales/{sale_id}", status_code=204)
async def delete_sale_route(sale_id: int, session=Depends(get_session)):
    delete_sale(session, sale_id)

# Product Routes
@router.get(
    "/products/{product_id}/analytics",
    status_code=200,
    response_model=GetProductAnalyticsResponse,
)
async def get_product_analytics_route(
    product_id: int,
    session=Depends(get_session),
):
    product = get_product_analytics(session, product_id)
    return GetProductAnalyticsResponse(product=product)


@router.post(
    "/products/search",
    status_code=200,
    response_model=PostProductSearchResponse,
)
async def post_product_search_route(
    req: PostProductSearchRequest,
    session=Depends(get_session),
):
    products = search_products(session, req)
    return PostProductSearchResponse(
        products=products.products,
        has_more=products.has_more,
    )


@router.post("/products", status_code=201)
async def post_product_route(
    req: PostProductRequest,
    session=Depends(get_session),
):
    create_product(session, req)


@router.patch("/products/{product_id}", status_code=204)
async def patch_product_route(
    product_id: int,
    req: PatchProductRequest,
    session=Depends(get_session),
):
    patch_product(session, product_id, req)


@router.patch("/products", status_code=204)
async def patch_products_route(
    req: PatchProductBulkRequest,
    session=Depends(get_session),
):
    patch_products(session, req)


@router.delete("/products/{product_id}", status_code=204)
async def delete_product_route(
    product_id: int,
    session=Depends(get_session),
):
    delete_product(session, product_id)

# Order Routes
@router.get(
    "/orders/{order_id}/user",
    status_code=200,
    response_model=GetOrderUserResponse,
)
async def get_order_user_route(
    order_id: int,
    session=Depends(get_session),
):
    order_user = get_order_user(session, order_id)
    return GetOrderUserResponse(
        order=order_user.order,
        user=order_user.user,
    )


@router.post(
    "/orders/search",
    status_code=200,
    response_model=PostOrdersSearchResponse,
)
async def post_orders_search_route(
    req: PostOrdersSearchRequest,
    session=Depends(get_session),
):
    orders = search_orders(session, req)
    return PostOrdersSearchResponse(
        orders=orders.orders,
        has_more=orders.has_more,
    )


@router.patch("/orders/{order_id}/status", status_code=204)
async def patch_order_status_route(
    order_id: int,
    req: PatchOrderStatusRequest,
    session=Depends(get_session),
):
    patch_order_status(session, order_id, req)


@router.patch("/orders/status", status_code=204)
async def patch_orders_status_route(
    req: PatchOrderBulkRequest,
    session=Depends(get_session),
):
    patch_orders_status(session, req)


@router.get("/performance", status_code=200, response_model=PerformanceAnalytics)
async def get_performance_route(session=Depends(get_session)):
    return get_performance(session)


@router.get("/attention", status_code=200, response_model=AttentionAnalytics)
async def get_attention_route(session=Depends(get_session)):
    return get_attention(session)


@router.get("/graph", status_code=200, response_model=GraphAnalytics)
async def get_graph_route(session=Depends(get_session)):
    return get_graph(session)
