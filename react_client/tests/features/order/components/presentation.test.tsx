import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import {
    useAdminSearchParams,
} from "@/features/order/hook"
import { AdminSearchTitle } from "@/features/order/components/presentation"

function AdminSearchTitleHarness() {
    const adminSearchParams = useAdminSearchParams()
    return (
        <AdminSearchTitle adminSearchParams={adminSearchParams} />
    )
}

describe("AdminSearchTitle intimacy: medium", () => {
    it("functionality displays the default order title", () => {
        renderWithRouter(<AdminSearchTitleHarness />, {
            initialPath: "/admin/orders",
        })

        expect(screen.getByText("All Orders")).toBeInTheDocument()
    })

    it("displays an active order-name search", () => {
        renderWithRouter(<AdminSearchTitleHarness />, {
            initialPath: "/admin/orders?searchName=amulet",
        })

        expect(screen.getByText("Searching: amulet"))
            .toBeInTheDocument()
    })

    it("displays selected order statuses", () => {
        renderWithRouter(<AdminSearchTitleHarness />, {
            initialPath: "/admin/orders?status=pending,shipped",
        })

        expect(screen.getByText("pending, shipped"))
            .toBeInTheDocument()
    })
})
