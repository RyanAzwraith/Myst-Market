
import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery 
} from '@tanstack/react-query'

import { 
    useQueryParams 
} from '@/hooks/QueryParams';
import { 
    useFormInputs
} from '@/hooks/FormInputs';

import { 
    logger,
    server,
    ServerException,
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
    registerFormFields,
    setPasswordFormFields,
    updateFormFields,
    adminSearchParams,
} from './schema';
import type { OnSubmit, FieldValues } from '@/hooks/FormInputs/schema';

export { 
    useRegisterFormInputs,
    useSetPasswordFormInputs,
    useUpdateFormInputs,
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
function useRegisterFormInputs(onSuccess?: () => void) {
    const { mutate } = useCreateMutation();

    const handleSubmit: OnSubmit<typeof registerFormFields> = ( 
        values, setErrorMsg,
    ) => mutate(
        values as UserInput, {
            onError(error) {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            },
            onSuccess() {
                onSuccess?.();
            }
    })

    return useFormInputs({
        fields: registerFormFields,
        onSubmit: handleSubmit
    })
}

function useSetPasswordFormInputs(onSuccess?: () => void) {
    const { mutate } = usePatchUserPasswordMutation();

    const handleSubmit: OnSubmit<typeof setPasswordFormFields> = ( 
        values, setErrorMsg,
    ) => mutate(
        values.password as string, {
            onError(error) {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            },
            onSuccess() {
                onSuccess?.();
            }
    })

    return useFormInputs({
        fields: setPasswordFormFields,
        onSubmit: handleSubmit
    })
}

function useUpdateFormInputs(onSuccess?: () => void) {
    const user = useAuthState(state => state.user)
    const { mutate } = usePatchUserMutation();

    const handleSubmit: OnSubmit<ReturnType<typeof updateFormFields>> = ( 
        values, setErrorMsg, reset
    ) => mutate(
        values as UserInput, {
            onError(error) {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            },
            onSuccess({user}) {
                const { email, name } = user
                reset({email, name})
                onSuccess?.();
            }
    })

    return useFormInputs({
        fields: updateFormFields(user),
        onSubmit: handleSubmit
    })
}

function useAdminSearchParams() {
    return useQueryParams(adminSearchParams, '/admin/users')
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