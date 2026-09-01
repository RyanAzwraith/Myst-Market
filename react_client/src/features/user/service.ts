
import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery 
} from '@tanstack/react-query'

import { 
    booleanFilter, 
    selectMultipleFilter, 
    selectOneFilter, 
    textFilter, 
    useQueryParams 
} from '@/utils/useQueryParams';
import { 
    textField,
    emailField,
    passwordField,
    useFormFields
} from '@/utils/useFormFields';

import { 
    logger,
    server,
} from '@/core';

import { useAuthState } from './index';

import type {
    UserInput,
    AdminSearchParams,
    AdminSort,
} from './schema';
import {
    adminSort,
    registration,
} from './schema';

export { 
    useRegisterFormFields,
    useSetPasswordFormFields,
    useUpdateFormFields,
    useAdminSearchParams,

    useCreateMutation,
    useSendPasswordEmailMutation,
    usePatchUserMutation,
    usePatchUserPasswordMutation,
    useUserDeleteMutation,
    useGetReviewsQuery,
    useGetOrderQuery,
    useGetOrdersQuery,
    useGetAnalyticsQuery,
    
    useAdminSearchQuery,
}

// Hooks
function useRegisterFormFields() {
    return useFormFields({
        name: textField({
            label: "Name",
            placeholder: "Name",
            validate: (v) => !v?.trim() ? "Name required" : null
        }),
        email: emailField({
            label: "Email",
            placeholder: "Email",
        }),
    })
}

function useSetPasswordFormFields() {
    return useFormFields({
        password: passwordField({
            label: "Password",
            validate: (v) => !v ? "Password required" : null
        }),
        rePassword: passwordField({
            label: "Re-enter Password",
            validate: (v) => !v ? "Re-enter Password required" : null
        })
    })
}

function useUpdateFormFields() {
    const user = useAuthState(state => state.user)
    return useFormFields({
        name: textField({
            label: "Name",
            placeholder: "Name",
            validate: (v) => !v?.trim() ? "Name required" : null,
            initial: user?.name
        }),
        email: emailField({
            label: "Email",
            placeholder: "Email",
            initial: user?.email
        })
    })
}

function useAdminSearchParams() {
    const filters = {
        registration: selectMultipleFilter({
            label: "Registration Type",
            options: registration
        }),
        sortBy: selectOneFilter({
            label: "sortBy",
            defaultValue: 'createdAt' as AdminSort,
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

    return useQueryParams(filters, '/admin/users')
}

// Request
function useGetAnalyticsQuery(user_id: number) {
    return useQuery({
        queryKey: ["user", "analytics", user_id],
        queryFn: () => 
            server.user.getAnalytics(user_id),
        select: (data) => data.user,
    })
}

function useGetReviewsQuery() {
    return useQuery({
        queryKey: ["user", "reviews"],
        queryFn: () => 
            server.user.getReviews(),
        select: (data) => data.reviews,
    })
}

function useGetOrderQuery(order_id: number) {
    return useQuery({
        queryKey: ["user", "order", order_id],
        queryFn: () => 
            server.user.getOrder(order_id),
        select: (data) => data.order,
    })
}

function useGetOrdersQuery() {
    return useQuery({
        queryKey: ["user", "orders"],
        queryFn: () => 
            server.user.getOrders(),
        select: (data) => data.orders,
    })
}

function useCreateMutation() {
    return useMutation({
        mutationFn: (userInput: UserInput) => 
            server.user.create({ userInput }),
    })
} 

function useSendPasswordEmailMutation() {
    return useMutation({
        mutationFn: () => 
            server.user.passwordEmail(),
        onError: () =>
            logger.error("Unexpected server error, unable to send password email"),
    })
} 

function usePatchUserMutation() {
    const setUserModel = useAuthState(state => state.setUser)
    return useMutation({
            mutationFn: (userInput: Partial<UserInput>) =>
                server.user.patch({ userInput }),
        onSuccess: ({ user}) => setUserModel(user)
    })
} 

function usePatchUserPasswordMutation() {
    const login = useAuthState(state => state.login)
    return useMutation({
        mutationFn: (password: string) =>
            server.user.patchPassword({ password }),
        onSuccess: ({ accessToken, user }) => 
            login(accessToken, user)
    })
}

function useUserDeleteMutation() {
    const logout = useAuthState(state => state.logout)
    return useMutation({
        mutationFn: () => 
           server.user.delete(),
        onSuccess: () => logout(),
        onError: () =>
            logger.error("Unexpected server error, unable to delete user account"),
    })
} 


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
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}