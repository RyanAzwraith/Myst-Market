import { 
    useQueryClient, 
    useMutation, 
    useQuery 
} from "@tanstack/react-query"

import { getServer } from "@/core/server";

import type { ReviewInput } from "./schema";

export {
    useCreateReviewMutation,
    useDeleteReviewMutation,
    useGetTestimonialsQuery,
}

function useCreateReviewMutation(productId:number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewInput : ReviewInput) =>
            getServer().review.create({ reviewInput }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["product-reviews", productId]
            })
        }
    })
} 

function useDeleteReviewMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: number) =>
            getServer().review.delete({ reviewId }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user-reviews"]
            })
        }
    })
} 

function useGetTestimonialsQuery(
    limit: number
) {
    return useQuery({
        queryKey: ["testimonials"],
        queryFn: () => 
            getServer().reviews.retrieveTestimonials({ limit}),
    })
}