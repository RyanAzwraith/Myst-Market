import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { reviewFactory } from "../../../mock_data/review"
import { server } from "@/core"
import {
    useCreateMutation,
    useDeleteMutation,
    useRetrieveTestimonialsQuery,
} from "@/features/review/service"

describe("useRetrieveTestimonialsQuery intimacy: medium", () => {
    it("functionality returns the requested testimonials", async () => {
        const reviews = [
            reviewFactory({ id: 1 }),
            reviewFactory({ id: 2 }),
        ]
        const retrieveTestimonials = vi.spyOn(
            server.reviews,
            "retrieveTestimonials",
        ).mockResolvedValue({ reviews })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useRetrieveTestimonialsQuery(6),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data).toEqual(reviews))
        expect(retrieveTestimonials).toHaveBeenCalledWith({ limit: 6 })
    })

    it("exposes a server error when testimonials cannot be loaded",
        async () => {
            const error = new Error("Testimonials unavailable")
            vi.spyOn(
                server.reviews,
                "retrieveTestimonials",
            ).mockRejectedValue(error)
            const { wrapper } = createWrapper()

            const { result } = renderHook(
                () => useRetrieveTestimonialsQuery(6),
                { wrapper },
            )

            await waitFor(() => expect(result.current.error).toBe(error))
        },
    )
})

describe("useCreateMutation intimacy: medium", () => {
    it("functionality creates a review and invalidates product reviews",
        async () => {
            const reviewInput = {
                rating: 4,
                description: "A helpful review.",
            }
            const create = vi.spyOn(server.review, "create")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(
                () => useCreateMutation(12),
                { wrapper },
            )

            await result.current.mutateAsync(reviewInput)

            expect(create).toHaveBeenCalledWith({ reviewInput })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["product-reviews", 12],
            })
        },
    )

    it("propagates server errors from review creation", async () => {
        const error = new Error("Unable to create review")
        vi.spyOn(server.review, "create").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCreateMutation(12),
            { wrapper },
        )

        await expect(result.current.mutateAsync({
            rating: 5,
        })).rejects.toBe(error)
    })
})

describe("useDeleteMutation intimacy: medium", () => {
    it("functionality deletes a review and invalidates user reviews",
        async () => {
            const remove = vi.spyOn(server.review, "delete")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(
                () => useDeleteMutation(),
                { wrapper },
            )

            await result.current.mutateAsync(9)

            expect(remove).toHaveBeenCalledWith({ reviewId: 9 })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["user-reviews"],
            })
        },
    )

    it("propagates server errors from review deletion", async () => {
        const error = new Error("Unable to delete review")
        vi.spyOn(server.review, "delete").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useDeleteMutation(),
            { wrapper },
        )

        await expect(result.current.mutateAsync(9)).rejects.toBe(error)
    })
})
