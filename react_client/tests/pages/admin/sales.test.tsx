import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../utils"
import { saleAnalyticsFactory } from "../../../mock_data/sale"
import { server } from "@/core"
import { SalesPage } from "@/pages/admin/sales"

describe("SalesPage intimacy: high", () => {
    it("functionality renders sale results and bulk controls", async () => {
        const sale = saleAnalyticsFactory({
            id: 61,
            name: "Admin Sale",
            discountPerc: 25,
            orderCount: 9,
        })
        const adminSearch = vi.spyOn(server.sales, "adminSearch")
            .mockResolvedValue({
                sales: [sale],
                hasMore: false,
            })

        renderWithRouter(<SalesPage />, {
            path: "/admin/sales",
            initialPath: "/admin/sales",
        })

        expect(screen.getByRole("button", {
            name: "Create sale",
        })).toBeInTheDocument()
        expect(await screen.findByText("Admin Sale"))
            .toBeInTheDocument()
        expect(screen.getByText("25% off")).toBeInTheDocument()
        expect(screen.getByText("9 orders")).toBeInTheDocument()
        expect(screen.getByText("All Sales")).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Update selected",
        })).toBeDisabled()
        expect(adminSearch).toHaveBeenCalledWith({
            searchParams: {
                search: "",
                activation: [],
                sort: "startAt",
                isAscending: false,
            },
            limit: 20,
            offset: 0,
        })
    })

    it("opens the create-sale form", async () => {
        vi.spyOn(server.sales, "adminSearch")
            .mockResolvedValue({ sales: [], hasMore: false })
        const user = userEvent.setup()

        renderWithRouter(<SalesPage />, {
            path: "/admin/sales",
            initialPath: "/admin/sales",
        })

        await user.click(screen.getByRole("button", {
            name: "Create sale",
        }))

        expect(screen.getByRole("dialog", { name: "Modal" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Create Sale",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Submit" }))
            .toBeInTheDocument()
    })

    it("offers another page when the server reports more sales", async () => {
        const sale = saleAnalyticsFactory({
            id: 62,
            name: "Second Page Sale",
        })
        vi.spyOn(server.sales, "adminSearch")
            .mockResolvedValue({
                sales: [sale],
                hasMore: true,
            })

        renderWithRouter(<SalesPage />, {
            path: "/admin/sales",
            initialPath: "/admin/sales",
        })

        await screen.findByText("Second Page Sale")
        expect(await screen.findByRole("button", {
            name: "Load more content",
        })).toBeInTheDocument()
    })
})
