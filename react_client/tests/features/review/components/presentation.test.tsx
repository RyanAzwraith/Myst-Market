import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { RatingFormat } from "@/features/review/components/presentation"

describe("RatingFormat intimacy: low", () => {
    it("functionality renders the numeric rating and five stars", () => {
        renderWithRouter(<RatingFormat rating={4} />)

        expect(screen.getByText("4.0/5")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "StarSolidIcon" }))
            .toHaveLength(4)
        expect(screen.getAllByRole("button", { name: "StarOutlineIcon" }))
            .toHaveLength(1)
    })

    it("rounds the displayed rating to one decimal place", () => {
        renderWithRouter(<RatingFormat rating={3.25} />)

        expect(screen.getByText("3.3/5")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "StarSolidIcon" }))
            .toHaveLength(3)
        expect(screen.getAllByRole("button", { name: "StarOutlineIcon" }))
            .toHaveLength(2)
    })

    it("reports the selected star when a rating is clicked", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(<RatingFormat rating={2} onClick={onClick} />)

        await user.click(screen.getAllByRole("button")[3])

        expect(onClick).toHaveBeenCalledWith(4)
    })
})
