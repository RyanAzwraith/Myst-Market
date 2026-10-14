import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { reviewFactory } from "../../../../mock_data/review"
import { server } from "@/core"
import { TestimonialLoader } from "@/features/review/components/loader"

describe("TestimonialLoader intimacy: medium", () => {
    it("functionality passes loaded testimonials to the renderer",
        async () => {
            const reviews = [
                reviewFactory({
                    id: 1,
                    description: "A featured review.",
                }),
            ]
            const retrieveTestimonials = vi.spyOn(
                server.reviews,
                "retrieveTestimonials",
            ).mockResolvedValue({ reviews })
            const renderTestimonials = vi.fn(
                (loadedReviews) => (
                    <p>{loadedReviews[0].description}</p>
                ),
            )

            renderWithRouter(
                <TestimonialLoader
                    limit={4}
                    render={renderTestimonials}
                />,
            )

            expect(await screen.findByText("A featured review."))
                .toBeInTheDocument()
            expect(retrieveTestimonials).toHaveBeenCalledWith({ limit: 4 })
            expect(renderTestimonials).toHaveBeenCalledWith(reviews)
        },
    )

    it("shows loading while testimonials are unavailable", () => {
        vi.spyOn(
            server.reviews,
            "retrieveTestimonials",
        ).mockReturnValue(new Promise(() => {}))

        renderWithRouter(
            <TestimonialLoader limit={4} render={vi.fn()} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
