
import type { ProductDetail, SaleDetail } from "@/features/shop/shopSchemas"
import type { ReviewDetail } from "@/features/review/ReviewSchemas"


type StatsDetail = {
    product_count: number,
    customer_count: number,
    total_average_rating: number,
}

// Routes
// GET /stats
// GET /products/featured
// POST /products/popular
// POST /products/newest
// POST /reviews/testimonials
// POST /sales/biggest

type GetStatsResponse = {
    stats: StatsDetail
}

type GetFeaturedProductResponse = {
    product: ProductDetail
}

type PostPopularProductRequest = {
    limit: number
}

type PostPopularProductResponse = {
    products: ProductDetail[]
}

type PostNewestProductRequest = {
    limit: number
}

type PostNewestProductResponse = {
    products: ProductDetail[]
}

type GetTestimonialsRequest = {
    limit: number
}

type GetTestimonialsResponse = {
    reviews: ReviewDetail[]
}

type GetBiggestSalesRequest = {
    limit: number
}

type GetBiggestSalesResponse = {
    sales: SaleDetail[]
}


export type {
    StatsDetail,
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
}

