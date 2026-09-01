import { 
    useQueryClient, 
    useMutation, 
    useQuery 
} from "@tanstack/react-query"

import { server } from "@/core/server";

import type { ReviewInput } from "./schema";

export {
    useCreateMutation,
    useDeleteMutation,
    useRetrieveTestimonialsQuery,
}

function useCreateMutation(productId:number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewInput : ReviewInput) =>
            server.review.create({ reviewInput }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["product-reviews", productId]
            })
        }
    })
} 

function useDeleteMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: number) =>
            server.review.delete({ reviewId }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user-reviews"]
            })
        }
    })
} 

function useRetrieveTestimonialsQuery(
    limit: number
) {
    return useQuery({
        queryKey: ["testimonials"],
        queryFn: () => 
            server.reviews.retrieveTestimonials({ limit}),
        select: data => data.reviews
    })
}