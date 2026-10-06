
import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery 
} from '@tanstack/react-query'

import { 
    logger,
    server,
} from '@/core';

import { useAuthState } from './index';

import type {
    UserInput,
    AdminSearchParams,
} from './schema';


export { 
    useCreateMutation,
    useSendPasswordEmailMutation,
    usePatchMutation,
    usePatchPasswordMutation,
    useDeleteMutation,
    useReviewsQuery,
    useOrderQuery,
    useOrdersQuery,
    useAnalyticsQuery,
    useAdminSearchQuery,
}


// Infinite Queries

function useAdminSearchQuery(
    limit: number | null,
    searchParams: Partial<AdminSearchParams> | null, 
) {
    return useInfiniteQuery({
        queryKey: ['users', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            server.users.adminSearch({
                searchParams,
                limit: limit,
                offset: pageParam,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined,
        select: (data) => ({
            ...data,
            users: data.pages.flatMap(page => page.users)
        }),
    })
}
// Queries
function useAnalyticsQuery(user_id: number) {
    return useQuery({
        queryKey: ["user", "analytics", user_id],
        queryFn: () => 
            server.user.getAnalytics(user_id),
        select: (data) => data.user,
    })
}

function useReviewsQuery() {
    return useQuery({
        queryKey: ["user", "reviews"],
        queryFn: () => 
            server.user.getReviews(),
        select: (data) => data.reviews,
    })
}

function useOrderQuery(order_id: number) {
    return useQuery({
        queryKey: ["user", "order", order_id],
        queryFn: () => 
            server.user.getOrder(order_id),
        select: (data) => data.order,
    })
}

function useOrdersQuery() {
    return useQuery({
        queryKey: ["user", "orders"],
        queryFn: () => 
            server.user.getOrders(),
        select: (data) => data.orders,
    })
}


// Mutations
function useCreateMutation({
    onSuccess, onError
}: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void
}) {
    return useMutation({
        mutationFn: (userInput: UserInput) => 
            server.user.create({ userInput }),
        onSuccess: () => onSuccess?.(),
        onError: (error) => {
            logger.error("Unexpected server error, unable to create user");
            onError?.(error)
        },
    })
} 

function useSendPasswordEmailMutation({
    onSuccess, onError
}: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void
}) {
    return useMutation({
        mutationFn: () => 
            server.user.passwordEmail(),
        onSuccess: () => onSuccess?.(),
        onError: (error) => {
            logger.error("Unexpected server error, unable to send password email");
            onError?.(error)
        },
    })
} 

function usePatchMutation({
    onSuccess, onError
}: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void
}) {
    const setUserModel = useAuthState(state => state.setUser)
    return useMutation({
            mutationFn: (userInput: Partial<UserInput>) =>
                server.user.patch({ userInput }),
        onSuccess: ({ user}) => {
            setUserModel(user)
            onSuccess?.()
        },
        onError: (error) => {
            logger.error("Unexpected server error, unable to patch user");
            onError?.(error)
        },
    })
} 

function usePatchPasswordMutation({
    onSuccess, onError
}: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void
}) {
    const login = useAuthState(state => state.login)
    return useMutation({
        mutationFn: (password: string) =>
            server.user.patchPassword({ password }),
        onSuccess: ({ accessToken, user }) => {
            login(accessToken, user)
            onSuccess?.()
        },
        onError: (error) => {
            logger.error("Unexpected server error, unable to patch password");
            onError?.(error)
        },
    })
}

function useDeleteMutation({
        onSuccess, onError
}: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void
}) {
    const logout = useAuthState(state => state.logout)
    return useMutation({
        mutationFn: () => 
           server.user.delete(),
        onSuccess: () => {
            logout()
            onSuccess?.()
        },
        onError: (error) => {
            logger.error("Unexpected server error, unable to delete user account");
            onError?.(error)
        },
    })
} 

