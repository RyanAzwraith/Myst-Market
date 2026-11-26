import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { AdminSearchTitle } from "@/features/sale/components/presentation"
import { useAdminSearchParams } from "@/features/sale/hook"

function SearchTitleHarness() {
    const adminSearchParams = useAdminSearchParams()
    return <AdminSearchTitle adminSearchParams={adminSearchParams} />
}

describe("AdminSearchTitle intimacy: medium", () => {
    it("functionality displays the default title", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/admin/sales",
        })

        expect(screen.getByText("All Sales")).toBeInTheDocument()
    })
})