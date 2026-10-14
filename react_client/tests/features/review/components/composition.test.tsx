import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { reviewFactory } from "../../../../mock_data/review"
import { ReviewCard } from "@/features/review/components/composition"

describe("ReviewCard intimacy: medium", () => {
    it("functionality renders review information and children", () => {
        const review = reviewFactory({
            userName: "Review Author",
            description: "A clear product review.",
        })

        renderWithRouter(
            <ReviewCard review={review}>
                <button type="button">Additional action</button>
            </ReviewCard>,
        )

        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Additional action" }))
            .toBeInTheDocument()
    })

    it("calls onClick when the review card is selected", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <ReviewCard
                review={reviewFactory({ userName: "Clickable Author" })}
                onClick={onClick}
            />,
        )

        await user.click(screen.getByText("Clickable Author"))

        expect(onClick).toHaveBeenCalledOnce()
    })
})
