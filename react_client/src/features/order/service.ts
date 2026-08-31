import { 
    useQuery,
    useInfiniteQuery, 
    useMutation, 
    useQueryClient
} from "@tanstack/react-query"

import { getServer } from "@/core/server"

import type {
    UserInput,
    ItemSummary,
} from "./index"
import type { 
    Status,
    Address, 
    AdminSort,
    AdminSearchParams,
} from "./schema"
import { 
    status,
    adminSort,
} from "./schema"
import { booleanFilter, selectMultipleFilter, selectOneFilter, textFilter, useQueryParams } from "@/utils/useQueryParams"

export {
    useAdminSearchParams,
    useCreateMutation,
    useGetByIdQuery,
    usePatchStatusMutation,
    useAdminSearchInfiniteQuery,
    useGetRecentQuery,
    usePatchAllStatusMutation,
}
// Hooks
function useAdminSearchParams() {
    const filters = {
        sortBy: selectOneFilter<AdminSort>({
            label: "sortBy",
            defaultValue: 'createdAt' as AdminSort,
            options: adminSort
        }),   
        status: selectMultipleFilter<Status>({
            label: "status",
            options: status
        }),
        searchName: textFilter({
            label: "Search by name",
            placeholder: "Search by name"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/orders')
}

// Request
function useCreateMutation()  {
    return useMutation({
        mutationFn: (req : {
            itemSummaries: ItemSummary[]
            addressDetail: Address
            deliveryNote: string
            userInput: UserInput | null
        }) =>
            getServer().order.create(req),
        onSuccess: (data) => { 
            window.location.href = data.stripeSessionUrl
        }
    })
}   

function useGetByIdQuery(id: number)  {
    return useQuery({
        queryKey: ['admin', 'order', id],
        queryFn: () => getServer().order.getById(id),
    })
}

function usePatchStatusMutation(id: number)  {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
            status: Status  
        }) =>
            getServer().order.patchStatus(id, req), 
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'orders']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'order', id]
            })
        }
    })
} 

function useAdminSearchInfiniteQuery(
    limit: number | null = null,
    params?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'orders', { ...params, limit }],
        queryFn: ({ pageParam }) => getServer().orders.adminSearch({
            searchParams: params ?? null,
            limit,
            offset: pageParam ?? 0
        }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

function useGetRecentQuery()  {
    return useQuery({
        queryKey: ['admin', 'recent'],
        queryFn: () => getServer().orders.getRecent,
    })
}

function usePatchAllStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
                orderIds: number[]
                status: Status
            }) => getServer().orders.patchStatus(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'orders']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'order']
            })
        }
    })
}

