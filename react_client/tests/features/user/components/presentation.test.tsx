import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { AdminSearchTitle } from "@/features/user/components/presentation"
import { useAdminSearchParams } from "@/features/user/hook"

function SearchTitleHarness() {
    const adminSearchParams = useAdminSearchParams()
    return <AdminSearchTitle adminSearchParams={adminSearchParams} />
}

describe("AdminSearchTitle intimacy: medium", () => {
    it("functionality displays the default title", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/admin/users",
        })

        expect(screen.getByText("All Users")).toBeInTheDocument()
    })

    it("displays the active search term", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/admin/users?search=amulet",
        })

        expect(screen.getByText("Searching: amulet")).toBeInTheDocument()
    })

    it("displays the selected registration filters", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/admin/users?registration=registered,guest",
        })

        expect(screen.getByText("registered, guest"))
            .toBeInTheDocument()
    })
})
