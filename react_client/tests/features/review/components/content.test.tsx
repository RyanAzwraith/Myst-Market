import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { reviewFactory } from "../../../../mock_data/review"
import { ReviewInfo } from "@/features/review/components/content"

describe("ReviewInfo intimacy: low", () => {
    it("functionality renders review author, date, rating, and text", () => {
        const review = reviewFactory({
            userName: "Avery Customer",
            createdAt: "2026-06-15",
            rating: 4,
            description: "A useful and reliable product.",
        })

        renderWithRouter(<ReviewInfo review={review} />)

        expect(screen.getByText("Avery Customer")).toBeInTheDocument()
        expect(screen.getByText("2026-06-15")).toBeInTheDocument()
        expect(screen.getByText("A useful and reliable product."))
            .toBeInTheDocument()
    })

    it("renders no placeholder text when a review has no description", () => {
        const review = reviewFactory({ description: null })

        renderWithRouter(<ReviewInfo review={review} />)

        expect(screen.queryByText("undefined")).not.toBeInTheDocument()
        expect(screen.queryByText("null")).not.toBeInTheDocument()
    })
})
