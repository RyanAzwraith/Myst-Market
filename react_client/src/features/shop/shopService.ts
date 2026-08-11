
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { captalizeString } from "@/utils/captalizeString";
import { listToRecord, swapRecord } from "@/utils/listMethods";
import { request } from "@/api";
import { 
    booleanFilter,
    selectOneFilter,
    selectMultipleFilter,
    textFilter,
    useQueryParams,
} from '@/utils/useQueryParams';

import { SortBy } from './shopSchemas'
import type {
    SaleDetail,
    ProductDetail,
    SortByType,
    ShopParams,
    GetCategoriesResponse,
    GetRaritiesResponse,
    GetSaleBySlugResponse,
    GetProductBySlugResponse,
    PostProductsSearchRequest,
    PostProductsSearchResponse,
} from './shopSchemas'

// Hooks
function useShopParams() {
    const { data: categories = [] } = useCategoriesQuery()
    const { data: rarities = [] } = useRaritiesQuery()

    const filters = {
        categories: selectMultipleFilter({
            label: "Category",
            options: listToRecord(categories, item => [captalizeString(item), item])
        }),
        rarities: selectMultipleFilter({
            label: "Rarity",
            options: listToRecord(rarities, item => [captalizeString(item), item])
        }),
        sortBy: selectOneFilter<SortByType>({
            label: "sortBy",
            defaultValue: SortBy.popularity,
            options: swapRecord(SortBy)
        }),        
        isAscending: booleanFilter({
            label: "Ascending",
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search products"
        }),
    }

    return useQueryParams(filters, '/shop')
}


// Queries
function useCategoriesQuery() {
    return useQuery ({
        queryKey: ["categories"],
        queryFn: () => request<GetCategoriesResponse>("/categories"),
        select: data => data.categories satisfies string[]
    })
}

function useRaritiesQuery() {
    return useQuery ({
        queryKey: ["rarities"],
        queryFn: () => request<GetRaritiesResponse>("/rarities"),
        select: data => data.rarities satisfies string[]
    
    })
}

function useSaleQuery(saleSlug?: string){
    return useQuery({
        queryKey: ["sale", saleSlug],
        queryFn: () =>  request<GetSaleBySlugResponse>(
             `/sale/${saleSlug}`
        ),
        select: data => data.sale satisfies SaleDetail
    })
}

function useProductQuery(productSlug?: string)  {
    return useQuery({
        queryKey: ["product", productSlug],
        queryFn: () => request<GetProductBySlugResponse>(
            `/product/${productSlug}`
        ),
        select: data => data.product satisfies ProductDetail
    })
}


function useProductsInfiniteQuery(
    limit?: number | null,
    shopParams: ShopParams={},
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...shopParams, limit }],
        queryFn: ({ pageParam }) => {
            const req: PostProductsSearchRequest = {
                limit: limit,
                offset: pageParam,
                ...shopParams
            }
            return request<PostProductsSearchResponse>(
                "/products/search", 
                {
                    method: "POST",
                    body: JSON.stringify(req),
                }
            )
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

export { 
    useShopParams, 
    useCategoriesQuery,
    useRaritiesQuery,
    useSaleQuery,
    useProductQuery,
    useProductsInfiniteQuery,
}
