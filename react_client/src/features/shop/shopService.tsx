import { AppRoutes } from '@/AppRoutes'
import {useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"

import { request } from "@/api";

const SortByOptions = {
    popularity: "popularity",
    price: "price",
    alphabet: "alphabet",
    newest: "newest",
    rarity: "rarity"
} as const 

type SortBy = typeof SortByOptions[keyof typeof SortByOptions]

type ShopParams = {
    categories?: string[],
    rarities?: string[],
    ascending?: boolean,
    sortBy?: SortBy,
    search?: string,
}

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
        ascending: makeGetterSetter<boolean>(
            'ascending', (v) => v === "true",(v) => v.toString()
        ),
        sortBy: makeGetterSetter<SortBy>(
            'sortBy', 
            (v) => (v && v in SortByOptions) 
                ?  v as SortBy : SortByOptions.popularity, 
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
        ascending: filters.ascending.value,
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

type GetCategoriesResponse = string[]
function useCategoriesQuery() {
    return useQuery ({
        queryKey: ["categories"],
        queryFn: async () => 
            request<GetCategoriesResponse>("/categories")
    })
}

type GetRaritiesResponse = string[]
function useRaritiesQuery() {
    return useQuery ({
        queryKey: ["rarities"],
        queryFn: async () => 
            request<GetRaritiesResponse>("/rarities")
    })
}

type Sale = {
    id: number,
    name: string,
    slug: string
    description: string,
    discountPercent: number,
    startAt: Date,
    endAt: Date
}

type GetSalesRouteResponse = Sale[]
function useSalesQuery() {
    return useQuery({
        queryKey: ["sales"],
        queryFn: async () => 
            request<GetSalesRouteResponse>("/sales"),
        select: sales =>
            Object.fromEntries(
                sales.map(sale => [sale.slug, sale])
            ) as Record<string, Sale>
    })
}

type Product = {
    id: number
    name: string
    categoryName: string
    rarityName: string
    priceAUDCent: number
    slug: string
    description: string
    stock: number,
    saleSlug: string | null
}

type GetProductResponse = Product
function useProductQuery(productSlug: string) {
    return useQuery({
        queryKey: ["product", productSlug],
        queryFn: async () => 
            request<GetProductResponse>(`/product/${productSlug}`),
    })
}

type PostProductsSearchRequest = ShopParams & {
    limit?: number | null
    offset?: number | null
}
type PostProductsSearchResponse = {
    products: Array<Product>,
    hasMore: boolean
}
function useProductsInfiniteQuery(
    limit?: number | null,
    shopParams: ShopParams={},
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...shopParams, limit }],
        queryFn: async ({ pageParam }) => 
            request<PostProductsSearchResponse>("/products/search", {
                method: "POST",
                body: JSON.stringify({
                    limit: limit,
                    offset: pageParam,
                    ...shopParams
                } as PostProductsSearchRequest),
            }
        ),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

export { 
    SortByOptions,
    type SortBy,
    useShopParams, 

    useCategoriesQuery,
    useRaritiesQuery,
    type Sale,
    useSalesQuery,
    type Product, 
    useProductQuery,
    useProductsInfiniteQuery,
}
