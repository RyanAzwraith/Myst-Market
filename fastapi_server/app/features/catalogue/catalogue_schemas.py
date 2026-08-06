from app.api.api_model import APIModel

from app.features.shop.shop_schemas import (
    ProductDetail,
    SaleDetail,
)
from app.features.review.review_schemas import (
    ReviewDetail,
)

class StatsDetail(APIModel):
    product_count: int
    customer_count: int
    total_average_rating: float


# Routes
# GET /stats
# GET /products/featured
# POST /products/popular
# POST /products/newest
# POST /reviews/testimonials
# POST /sales/biggest


class GetStatsResponse(APIModel):
    stats: StatsDetail


class GetFeaturedProductResponse(APIModel):
    product: ProductDetail


class PostPopularProductRequest(APIModel):
    limit: int


class PostPopularProductResponse(APIModel):
    products: list[ProductDetail]


class PostNewestProductRequest(APIModel):
    limit: int


class PostNewestProductResponse(APIModel):
    products: list[ProductDetail]


class GetTestimonialsRequest(APIModel):
    limit: int


class GetTestimonialsResponse(APIModel):
    reviews: list[ReviewDetail]


class GetBiggestSalesRequest(APIModel):
    limit: int


class GetBiggestSalesResponse(APIModel):
    sales: list[SaleDetail]