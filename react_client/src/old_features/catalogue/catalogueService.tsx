import { useQuery } from "@tanstack/react-query"

import { request } from "@/api"

import type { ProductDetail, SaleDetail } from "@/features/shop/shopSchemas"
import type { ReviewDetail } from "@/features/review/ReviewSchemas"

import type {
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
} from "@/features/catalogue/catalogueSchemas"

function useStatsQuery() {
    return useQuery ({
        queryKey: ["stats"],
        queryFn: () => request<GetStatsResponse>("/stats"),
        select: data => data.stats satisfies StatsDetail
    })
}

function useFeaturedProductQuery() {
    return useQuery ({
        queryKey: ["featuredProduct"],
        queryFn: () => request<GetFeaturedProductResponse>(
            "/products/featured"
        ),
        select: data => data.product satisfies ProductDetail
    })
}

function usePopularProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['popularProducts', limit],
        queryFn: () => {
            const req: PostPopularProductRequest = {
                limit: limit,
            }
            return request<PostPopularProductResponse>(
                "/products/popular", 
                {
                    method: "POST",
                    body: JSON.stringify(req),
                }
            )
        },
        select: data => data.products satisfies ProductDetail[]
    })
}  

function useNewestProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['newestProducts', limit],
        queryFn: () => {
            const req: PostNewestProductRequest = {
                limit: limit,
            }
            return request<PostNewestProductResponse>(
                "/products/newest", 
                {
                    method: "POST",
                    body: JSON.stringify(req),
                }
            )
        },
        select: data => data.products satisfies ProductDetail[]
    })
}  

function useTestimonialsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['testimonials', limit],
        queryFn: () => {
            const req: GetTestimonialsRequest = {
                limit: limit,
            }
            return request<GetTestimonialsResponse>(
                "/reviews/testimonials", 
                {
                    method: "POST",
                    body: JSON.stringify(req),
                }
            )
        },
        select: data => data.reviews satisfies ReviewDetail[]
    })
}  

function useBiggestSalesQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['biggestSales', limit],
        queryFn: () => {
            const req: GetBiggestSalesRequest = {
                limit: limit,
            }
            return request<GetBiggestSalesResponse>(
                "/sales/biggest", 
                {
                    method: "POST",
                    body: JSON.stringify(req),
                }
            )
        },
        select: data => data.sales satisfies SaleDetail[]
    })
}  

export {
    useStatsQuery,
    useFeaturedProductQuery,
    usePopularProductsQuery,
    useNewestProductsQuery,
    useTestimonialsQuery,
    useBiggestSalesQuery,
}