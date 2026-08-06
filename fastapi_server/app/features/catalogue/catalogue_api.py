from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_session

from app.features.catalogue.catalogue_schemas import (
    GetStatsResponse,
    GetFeaturedProductResponse,
    PostPopularProductRequest,
    PostPopularProductResponse,
    PostNewestProductRequest,
    PostNewestProductResponse,
    GetTestimonialsRequest,
    GetTestimonialsResponse,
    GetBiggestSalesRequest,
    GetBiggestSalesResponse,
)

from .catalogue_service import (
    get_stats,
    get_featured_product,
    get_popular_products,
    get_newest_products,
    get_testimonials,
    get_biggest_sales,
)


router = APIRouter()


@router.get("/stats", response_model=GetStatsResponse)
def get_stats_route(
    session: Session = Depends(get_session),
):
    stats = get_stats(session)
    return GetStatsResponse(
        stats=stats
    )


@router.get("/products/featured", response_model=GetFeaturedProductResponse)
def get_featured_product_route(
    session: Session = Depends(get_session),
):
    product = get_featured_product(session)
    return GetFeaturedProductResponse(
        product = product
    )


@router.post("/products/popular", response_model=PostPopularProductResponse)
def get_popular_products_route(
    request: PostPopularProductRequest,
    session: Session = Depends(get_session),
):
    products = get_popular_products(
        session, limit=request.limit,
    )
    return PostPopularProductResponse(
        products = products
    )


@router.post("/products/newest", response_model=PostNewestProductResponse)
def get_newest_products_route(
    request: PostNewestProductRequest,
    session: Session = Depends(get_session),
):
    products = get_newest_products(
        session, limit=request.limit,
    )
    return PostNewestProductResponse(
        products = products
    )


@router.post("/reviews/testimonials", response_model=GetTestimonialsResponse)
def get_testimonials_route(
    request: GetTestimonialsRequest,
    session: Session = Depends(get_session),
):
    reviews = get_testimonials(
        session, limit=request.limit,
    )
    return GetTestimonialsResponse(
        reviews = reviews
    )

@router.post("/sales/biggest", response_model=GetBiggestSalesResponse)
def get_biggest_sales_route(
    request: GetBiggestSalesRequest,
    session: Session = Depends(get_session),
):    
    sales = get_biggest_sales(
        session, limit=request.limit,
    )
    return GetBiggestSalesResponse(
        sales = sales
    )
