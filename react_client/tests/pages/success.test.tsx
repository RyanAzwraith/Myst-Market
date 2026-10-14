import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../utils"
import { SuccessPage } from "@/pages/success"

describe("SuccessPage intimacy: low", () => {
    it("functionality renders the payment confirmation", () => {
        renderWithRouter(<SuccessPage />, {
            path: "/success",
            initialPath: "/success",
        })

        expect(screen.getByRole("heading", { name: "Success!" }))
            .toBeInTheDocument()
        expect(screen.getByText("Your payment was a success."))
            .toBeInTheDocument()
        expect(screen.getByText("Check your email for confirmation."))
            .toBeInTheDocument()
    })
})
