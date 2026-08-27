
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
    useFormInputs,
    textInput,
    passwordInput,
    emailInput,

} from '@/utils/useFormInputs';

import { logger } from '@/core/logger';
import { getServer } from '@/core/server';

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
    useGetReviewQuery,
    useGetOrderQuery,
    useGetOrdersQuery,
    useGetAnalyticsQuery,
    
    useAdminSearchQuery,
}

// Hooks
function useRegisterFormFields() {
    return useFormInputs({
        name: textInput({
            label: "Name",
            placeholder: "Name",
            validateFunc: (v) => !v?.trim() ? "Name required" : null
        }),
        email: emailInput({
            label: "Email",
            placeholder: "Email",
        }),
    })
}

function useSetPasswordFormFields() {
    return useFormInputs({
        password: passwordInput({
            label: "Password",
            validateFunc: (v) => !v ? "Password required" : null
        }),
        rePassword: passwordInput({
            label: "Re-enter Password",
            validateFunc: (v) => !v ? "Re-enter Password required" : null
        })
    })
}

function useUpdateFormFields() {
    const user = useAuthState(state => state.user)
    return useFormInputs({
        name: textInput({
            label: "Name",
            placeholder: "Name",
            validateFunc: (v) => !v?.trim() ? "Name required" : null,
            initial: user?.name
        }),
        email: emailInput({
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
function useCreateMutation() {
    return useMutation({
        mutationFn: (userInput: UserInput) => 
            getServer().user.create({ userInput }),
    })
} 

function useSendPasswordEmailMutation() {
    return useMutation({
        mutationFn: () => 
            getServer().user.passwordEmail(),
        onError: () =>
            logger.error("Unexpected server error, unable to send password email"),
    })
} 

function usePatchUserMutation() {
    const setUserModel = useAuthState(state => state.setUser)
    return useMutation({
            mutationFn: (userInput: Partial<UserInput>) =>
                getServer().user.patch({ userInput }),
        onSuccess: ({ user}) => setUserModel(user)
    })
} 

function usePatchUserPasswordMutation() {
    const login = useAuthState(state => state.login)
    return useMutation({
        mutationFn: (password: string) =>
            getServer().user.patchPassword({ password }),
        onSuccess: ({ accessToken, user }) => 
            login(accessToken, user)
    })
}

function useUserDeleteMutation() {
    const logout = useAuthState(state => state.logout)
    return useMutation({
        mutationFn: () => 
           getServer().user.delete(),
        onSuccess: () => logout(),
        onError: () =>
            logger.error("Unexpected server error, unable to delete user account"),
    })
} 

function useGetReviewQuery() {
    return useQuery({
        queryKey: ["user", "reviews"],
        queryFn: () => 
            getServer().user.getReviews(),
        select: (data) => data.reviews,
    })
}

function useGetOrderQuery(order_id: number) {
    return useQuery({
        queryKey: ["user", "order", order_id],
        queryFn: () => 
            getServer().user.getOrder(order_id),
        select: (data) => data.order,
    })
}

function useGetOrdersQuery() {
    return useQuery({
        queryKey: ["user", "orders"],
        queryFn: () => 
            getServer().user.getOrders(),
        select: (data) => data.orders,
    })
}

function useGetAnalyticsQuery(user_id: number) {
    return useQuery({
        queryKey: ["user", "analytics", user_id],
        queryFn: () => 
            getServer().user.getAnalytics(user_id),
        select: (data) => data.user,
    })
}

function useAdminSearchQuery(
    limit: number | null,
    searchParams: Partial<AdminSearchParams> | null, 
) {
    return useInfiniteQuery({
        queryKey: ['users', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            getServer().users.adminSearch({
                searchParams,
                limit: limit,
                offset: pageParam,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}