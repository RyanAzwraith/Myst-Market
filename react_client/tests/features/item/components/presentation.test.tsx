import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { OnSaleDiv } from "@/features/item/components/presentation"

describe("OnSaleDiv intimacy: low", () => {
    it("functionality marks sale content with the sale style", () => {
        renderWithRouter(
            <OnSaleDiv onSale={true}>
                <span>Sale content</span>
            </OnSaleDiv>,
        )

        const content = screen.getByText("Sale content")
        expect(content.parentElement).toHaveClass("bg-red-200")
    })

    it("does not add sale styling to regular content", () => {
        renderWithRouter(
            <OnSaleDiv onSale={false}>
                <span>Regular content</span>
            </OnSaleDiv>,
        )

        const content = screen.getByText("Regular content")
        expect(content.parentElement).not.toHaveClass("bg-red-200")
    })
})
