import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from "@tanstack/react-query"

import { 
    booleanFilter, 
    selectMultipleFilter, 
    selectOneFilter, 
    textFilter, 
    useQueryParams 
} from "@/utils/useQueryParams"

import { getServer } from "@/core/server"

import type {
    AdminSort,
    AdminSearchParams,
} from "./schema"
import {
    activation,
    adminSort,
} from "./schema"
 
export { 
    useSaleParams,
    useSaleQuery,
    useSaleImageQuery,
    useSaleMediasQuery,
    useSaleAnalyticsQuery,
    usePostSaleMutation,
    usePatchSaleMutation,
    usePatchSalesMutation,
    useDeleteSaleMutation,
    useSalesInfiniteQuery,
    useBiggestSalesQuery,
}

// Hooks
function useSaleParams() {

    const filters = {
        activation: selectMultipleFilter({
            label: "Activation Type",
            options: activation,
        }),
        sortBy: selectOneFilter({
            label: "sortBy",
            defaultValue: 'startAt' as AdminSort,
            options: adminSort
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/sales')
}

// Requests
function useSaleQuery(slug: string | undefined) {
    return useQuery({
        queryKey: ["sale", slug],
        enabled: !!slug,
        queryFn: () => getServer().sale.getBySlug(slug!),
        select: data => data.sale
    })
}

function useSaleImageQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-image", saleId],
        queryFn: () =>  getServer().sale.getImage(saleId),
        select: data => data.media,
    })
}
function useSaleMediasQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-medias", saleId],
        queryFn: () => getServer().sale.getMedias(saleId),
        select: data => data.medias,
    })
}

function useSaleAnalyticsQuery(saleId: number) {
    return useQuery({
        queryKey: ['admin', 'sale-analytics', saleId],
        queryFn: () => getServer().sale.getAnalytics(saleId),
        select: data => data.sale,
    })
}

function usePostSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: {
            name: string
            slug: string
            description: string
            discountPercent: number
            startAt: Date
            endAt: Date
        }) => getServer().sale.create(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchSaleMutation(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : Partial<{
            name: string
            slug: string
            description: string
            startAt: Date
            endAt: Date
            discountPercent: number
        }>) => getServer().sale.patch(id, req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sale-analytics', id]
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchSalesMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: Partial<{
            ids: number[]
            startAt: Date | null
            endAt: Date | null
            discountPercent: number | null
        }>) => getServer().sales.patch(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sale-analytics']
            })
        }
    })
}

function useDeleteSaleMutation(saleId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => getServer().sale.delete(saleId),
        onSuccess: () => 
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
    })
}


function useSalesInfiniteQuery(
    limit: number | null,
    searchParams?: AdminSearchParams
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'sales', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => {
            return getServer().sales.search({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            })
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) =>
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined
    })
}


function useBiggestSalesQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['biggestSales', limit],
        queryFn: () => getServer().sales.retrieveBiggest({ limit }),
        select: data => data.sales
    })
}  

