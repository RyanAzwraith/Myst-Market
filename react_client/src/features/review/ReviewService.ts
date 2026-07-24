import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"

import { authRequest } from "@/api"

import type {
    GetProductReviewsResponse,
    GetUserReviewsResponse,
    PostReviewRequest,
} from "@/features/review/ReviewSchemas"


function useProductReviewsQuery(productId:number) {
    return useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: () =>
            authRequest<GetProductReviewsResponse>(
                `/products/${productId}/reviews`
            ),
    })
}

function useCreateReviewMutation(productId:number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn (req: PostReviewRequest) {
            return authRequest(`/products/${productId}/reviews`, {
                method: "POST",
                body: JSON.stringify(req)
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["product-reviews", productId]
            })
        }
    })
} 

function useUserReviewsQuery(userId:number) {
    return useQuery({
        queryKey: ["user-reviews", userId],
        queryFn: () => 
            authRequest<GetUserReviewsResponse>(`/users/${userId}/reviews`),
    })
}

function useDeleteReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn (reviewId: number) {
            return authRequest(`/reviews/${reviewId}`, {
                method: "DELETE",
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user-reviews"]
            })
        }
    })
} 

export {
    useProductReviewsQuery,
    useCreateReviewMutation,
    useUserReviewsQuery,
    useDeleteReviewMutation,
}