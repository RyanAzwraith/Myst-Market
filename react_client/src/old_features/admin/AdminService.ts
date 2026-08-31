
import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from '@tanstack/react-query';

import { 
    capitalizeString,
    listToRecord
} from '@/utils/funcs';
import { 
    selectMultipleFilter, 
    selectOneFilter, 
    booleanFilter, 
    textFilter, 
    useQueryParams 
} from '@/utils/useQueryParams';
import { authRequest } from '@/api';

import type { 
    ProductSortByType,
    OrderStatusType,
    OrderSortByType,

    GetUserAnalyticsResponse,
    PostUserSearchRequest,
    PostUserSearchResponse,

    GetSaleAnalyticsResponse,
    PostSaleSearchRequest,
    PostSaleSearchResponse,
    PatchSaleRequest,
    PatchSaleBulkRequest,
    PostSaleRequest,

    GetProductAnalyticsResponse,
    PerformanceAnalytics,
    AttentionAnalytics,
    GraphAnalytics,
    PostProductSearchRequest,
    PostProductSearchResponse,
    PostProductRequest,
    PatchProductRequest,
    PatchProductBulkRequest,

    GetOrderUserResponse,
    PostOrdersSearchRequest,
    PostOrdersSearchResponse,
    PatchOrderStatusRequest,
    PatchOrderBulkRequest,
    UserSortByType,
    SaleSortByType,
} from './AdminSchema';
import {     
    UserSortBy,
    Registration,
    OrderSortBy,
    OrderStatus,
    SaleSortBy,
    ProductSortBy,
    SaleActivation,
 } from './AdminSchema';
import { useCategoriesQuery, useRaritiesQuery } from '../shop/shopService';

function useUserParams() {

    const filters = {
        registration: selectMultipleFilter({
            label: "Registration Type",
            options: Registration
        }),
        sortBy: selectOneFilter({
            label: "sortBy",
            defaultValue: 'createdAt' as UserSortByType,
            options: UserSortBy
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/users')
}

function useUsersInfiniteQuery(
    limit?: number | null,
    params: Omit<PostUserSearchRequest, 'limit' | 'offset'> = {}
) {
    return useInfiniteQuery({
        queryKey: ['admin','users', { ...params, limit }],
        queryFn: ({ pageParam }) => {
            const req: PostUserSearchRequest = {
                limit: limit,
                offset: pageParam,
                ...params
            }
            return authRequest<PostUserSearchResponse>(
                '/admin/users/search',
                {
                    method: 'POST',
                    body: JSON.stringify(req),
                }
            )
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) =>
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined
    })
}

function useUserAnalyticsQuery(userId: number) {
    return useQuery({
        queryKey: ['admin', 'user-analytics', userId],
        queryFn: () => authRequest<GetUserAnalyticsResponse>(
            `/admin/users/${userId}/analytics`
        ),
    })
}

function useSaleParams() {

    const filters = {
        activation: selectMultipleFilter({
            label: "Activation Type",
            options: SaleActivation
        }),
        sortBy: selectOneFilter({
            label: "sortBy",
            defaultValue: 'startAt' as SaleSortByType,
            options: SaleSortBy
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

function useSalesInfiniteQuery(
    limit?: number | null,
    params: Omit<PostSaleSearchRequest, 'limit' | 'offset'> = {}
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'sales', { ...params, limit }],
        queryFn: ({ pageParam }) => {
            const req: PostSaleSearchRequest = {
                limit: limit,
                offset: pageParam,
                ...params
            }
            return authRequest<PostSaleSearchResponse>(
                '/admin/sales/search',
                {
                    method: 'POST',
                    body: JSON.stringify(req),
                }
            )
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) =>
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined
    })
}

function useSaleAnalyticsQuery(saleId: number) {
    return useQuery({
        queryKey: ['admin', 'sale-analytics', saleId],
        queryFn: () => authRequest<GetSaleAnalyticsResponse>(
            `/admin/sales/${saleId}/analytics`
        ),
    })
}

function usePostSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(data: PostSaleRequest) {
            return authRequest('/admin/sales', {
                method: 'POST',
                body: JSON.stringify(data),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn({ saleId, data }: {
            saleId: number
            data: PatchSaleRequest
        }) {
            return authRequest(`/admin/sales/${saleId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            })
        },
        onSuccess: (_data, { saleId }) => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sale-analytics', saleId]
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchSaleBulkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(data: PatchSaleBulkRequest) {
            return authRequest('/admin/sales', {
                method: 'PATCH',
                body: JSON.stringify(data),
            })
        },
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

function useDeleteSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(saleId: number) {
            return authRequest(`/admin/sales/${saleId}`, {
                method: 'DELETE',
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function useProductParams() {
    const { data: categories = [] } = useCategoriesQuery()
    const { data: rarities = [] } = useRaritiesQuery()
    
    const filters = {
        isDiscontinued: booleanFilter({
            label: "Discontinued",
        }),
        sortBy: selectOneFilter<ProductSortByType>({
            label: "sortBy",
            defaultValue: 'newest' as ProductSortByType,
            options: ProductSortBy
        }),
        categories: selectMultipleFilter<string>({
            label: 'Categories',
            options: listToRecord(categories, item => [capitalizeString(item), item])
        }),
        rarities: selectMultipleFilter<string>({
            label: 'Rarities',
            options: listToRecord(rarities, item => [capitalizeString(item), item])
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/products')
}

function useProductsInfiniteQuery(
    limit?: number | null,
    params: Omit<PostProductSearchRequest, 'limit' | 'offset'> = {}
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'products', { ...params, limit }],
        queryFn: ({ pageParam }) => {
            const req: PostProductSearchRequest = {
                limit: limit,
                offset: pageParam,
                ...params
            }
            return authRequest<PostProductSearchResponse>(
                '/admin/products/search',
                {
                    method: 'POST',
                    body: JSON.stringify(req),
                }
            )
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) =>
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined
    })
}

function useProductAnalyticsQuery(productId?: number) {
    return useQuery({
        queryKey: ['admin', 'product-analytics', productId],
        queryFn: () => authRequest<GetProductAnalyticsResponse>(
            `/admin/products/${productId}/analytics`
        ),
        enabled: productId != null,
    })
}

function useTopProductsQuery() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'top-products'],
        queryFn: () => authRequest<PostProductSearchResponse>(
            '/admin/products/search',
            {
                method: 'POST',
                body: JSON.stringify({
                    limit: 5,
                    offset: 0,
                    sortBy: 'quantitySold',
                    isAscending: false,
                } satisfies PostProductSearchRequest),
            },
        ),
    })
}

function usePostProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(data: PostProductRequest) {
            return authRequest('/admin/products', {
                method: 'POST',
                body: JSON.stringify(data),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}

function usePatchProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn({ productId, data }: {
            productId: number
            data: PatchProductRequest
        }) {
            return authRequest(`/admin/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            })
        },
        onSuccess: (_data, { productId }) => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'product-analytics', productId]
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}

function usePatchProductBulkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(data: PatchProductBulkRequest) {
            return authRequest('/admin/products', {
                method: 'PATCH',
                body: JSON.stringify(data),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'product-analytics']
            })
        }
    })
}

function useDeleteProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(productId: number) {
            return authRequest(`/admin/products/${productId}`, {
                method: 'DELETE',
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}


function useOrderParams() {

    const filters = {
        sortBy: selectOneFilter<OrderSortByType>({
            label: "sortBy",
            defaultValue: 'createdAt' as OrderSortByType,
            options: OrderSortBy
        }),   
        status: selectMultipleFilter<OrderStatusType>({
            label: "status",
            options: OrderStatus
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

function useOrdersInfiniteQuery(
    limit?: number | null,
    params: Omit<PostOrdersSearchRequest, 'limit' | 'offset'> = {}
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'orders', { ...params, limit }],
        queryFn: ({ pageParam }) => {
            const req: PostOrdersSearchRequest = {
                limit: limit,
                offset: pageParam,
                ...params
            }
            return authRequest<PostOrdersSearchResponse>(
                "/admin/orders/search", 
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

function useOrderQuery(orderId?: number)  {
    return useQuery({
        queryKey: ['admin', 'order', orderId],
        queryFn: () => authRequest<GetOrderUserResponse>(
            `/admin/orders/${orderId}/user`
        ),
        enabled: orderId != null,
    })
}

function useRecentOrdersQuery() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'recent-orders'],
        queryFn: () => authRequest<PostOrdersSearchResponse>(
            '/admin/orders/search',
            {
                method: 'POST',
                body: JSON.stringify({
                    limit: 5,
                    offset: 0,
                    sortBy: 'createdAt',
                    isAscending: false,
                } satisfies PostOrdersSearchRequest),
            },
        ),
    })
}

function usePatchOrderStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn ({ orderId, status }: {
            orderId: number
            status: OrderStatusType
        }) {
            const req: PatchOrderStatusRequest = { status }
            return authRequest(`/admin/orders/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify(req),
            })
        },
        onSuccess: (_data, { orderId }) => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'orders']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'order', orderId]
            })
        }
    })
} 

function usePatchOrderBulk() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn(data: PatchOrderBulkRequest) {
            return authRequest('/admin/orders/status', {
                method: "PATCH",
                body: JSON.stringify(data),
            })
        },
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

function usePerformanceQuery(periodDays: number) {
    return useQuery({
        queryKey: ['admin', 'performance', periodDays],
        queryFn: () => authRequest<PerformanceAnalytics>(
            `/admin/performance?periodDays=${periodDays}`
        ),
    })
}

function useAttentionQuery() {
    return useQuery({
        queryKey: ['admin', 'attention'],
        queryFn: () => authRequest<AttentionAnalytics>('/admin/attention'),
    })
}

function useGraphQuery() {
    return useQuery({
        queryKey: ['admin', 'graph'],
        queryFn: () => authRequest<GraphAnalytics>('/admin/graph'),
    })
}

export {
    useUserParams,
    useUsersInfiniteQuery,
    useUserAnalyticsQuery,

    useSaleParams,
    useSalesInfiniteQuery,
    useSaleAnalyticsQuery,
    usePostSaleMutation,
    usePatchSaleMutation,
    usePatchSaleBulkMutation,
    useDeleteSaleMutation,

    useProductParams,
    useProductsInfiniteQuery,
    useProductAnalyticsQuery,
    useTopProductsQuery,
    usePostProductMutation,
    usePatchProductMutation,
    usePatchProductBulkMutation,
    useDeleteProductMutation,

    useOrderParams,
    useOrdersInfiniteQuery,
    useRecentOrdersQuery,
    usePerformanceQuery,
    useAttentionQuery,
    useGraphQuery,
    useOrderQuery,
    usePatchOrderStatusMutation,
    usePatchOrderBulk
}

