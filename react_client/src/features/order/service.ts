import { 
    useQuery,
    useInfiniteQuery, 
    useMutation, 
    useQueryClient
} from "@tanstack/react-query"

import { server } from "@/core/server"

import type {
    UserInput,
    ItemSummary,
} from "./index"
import type { 
    Status,
    Address, 
    AdminSearchParams,
} from "./schema"


export {
    useAdminSearchQuery,
    useOrderQuery,
    useRecentQuery,
    useCreateMutation,
    usePatchStatusMutation,
    usePatchManyStatusMutation
}


// Infinite Queries
function useAdminSearchQuery(
    limit: number | null = null,
    params?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'orders', { ...params, limit }],
        queryFn: ({ pageParam }) => server.orders.adminSearch({
            searchParams: params ?? null,
            limit,
            offset: pageParam ?? 0
        }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined,
        select: data => ({
            ...data,
            orders: data.pages.flatMap(page => page.orders)
        }),
    })
}


// Queries
function useOrderQuery(id: number | undefined)  {
    return useQuery({
        queryKey: ['admin', 'order', id],
        enabled: !!id,
        queryFn: () => server.order.getById(id!),
    })
}

function useRecentQuery()  {
    return useQuery({
        queryKey: ['admin', 'recent'],
        queryFn: () => server.orders.getRecent(),
        select: data => data.orders,
    })
}

// Mutations
function useCreateMutation()  {
    return useMutation({
        mutationFn: (req : {
            items: ItemSummary[]
            address: Address
            deliveryNote: string
            user: UserInput | null
            isCreatingAccount: boolean  | null
        }) => server.order.create(req),
        onSuccess: (data) => { 
            window.location.href = data.stripeSessionUrl
        }
    })
}   

function usePatchStatusMutation(id: number)  {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
            status: Status  
        }) =>
            server.order.patchStatus(id, req), 
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


function usePatchManyStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
                orderIds: number[]
                status: Status
            }) => server.orders.patchStatus(req),
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

