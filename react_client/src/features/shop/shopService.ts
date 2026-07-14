import { AppRoutes } from '@/AppRoutes'
import {useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"

import { request } from "@/api";

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


function useShopParams() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const params = new URLSearchParams(searchParams)

    function makeGetterSetter<T,>( 
        name: string, 
        parse: (value: string | null) => T,
        serialize: (newValue: T) => string
    ) {
        const param = parse(params.get(name))
        const setParam = (setter: (prevValue: T) => T) =>
            params.set(name, serialize(setter(param)))
        return {value: param, set: setParam}
    }

    const filters = {
        categories: makeGetterSetter<string[]>(
            'categories', (v) => v?.split(",") ?? [], (v) => v?.join(',')
        ),
        rarities: makeGetterSetter<string[]>(
            'rarities', (v) => v?.split(",") ?? [], (v) => v.join(',')
        ),
        isAscending: makeGetterSetter<boolean>(
            'isAscending', (v) => v === "true",(v) => v.toString()
        ),
        sortBy: makeGetterSetter<SortByType>(
            'sortBy', 
            (v) => (v && v in SortBy) 
                ?  v as SortByType : SortBy.popularity, 
            (v) => v
        ),
        search: makeGetterSetter<string>(
            'search', (v) => v ?? '', (v) => v.toString()
        ),
    }
    
    function navigateShop() {
        const cleanParams = new URLSearchParams(params)
        params.forEach((v, k) => {if (!v) cleanParams.delete(k)})
        const query = cleanParams.toString()
        navigate(query? `${AppRoutes.shop}?${query}`: AppRoutes.shop)
    }

    const shopParams = Object.fromEntries(Object.entries({
        categories: filters.categories.value,
        rarities: filters.rarities.value,
        isAscending: filters.isAscending.value,
        sortBy: filters.sortBy.value,
        search: filters.search.value,
    }).filter(([k, v]) => 
        Array.isArray(v) ? v.length > 0 : v !== ""
    )) as ShopParams

    return {
        ...filters,
        navigateShop,
        shopParams,
    }
}

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
