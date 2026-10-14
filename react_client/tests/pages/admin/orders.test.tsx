import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../utils"
import { orderSummaryFactory } from "../../../mock_data/order"
import { server } from "@/core"
import { OrdersPage } from "@/pages/admin/orders"

describe("OrdersPage intimacy: high", () => {
    it("functionality renders filtered order results and controls",
        async () => {
            const order = orderSummaryFactory({
                id: 41,
                status: "processing",
                totalCent: 4800,
            })
            const adminSearch = vi.spyOn(server.orders, "adminSearch")
                .mockResolvedValue({
                    orders: [order],
                    hasMore: false,
                })

            renderWithRouter(<OrdersPage />, {
                path: "/admin/orders",
                initialPath: "/admin/orders",
            })

            expect(await screen.findByText("Order #41"))
                .toBeInTheDocument()
            expect(screen.getByText("processing"))
                .toBeInTheDocument()
            expect(screen.getByText("All Orders")).toBeInTheDocument()
            expect(screen.getByLabelText("Select all"))
                .toBeInTheDocument()
            expect(screen.getByRole("button", {
                name: "Update selected",
            })).toBeDisabled()
            expect(adminSearch).toHaveBeenCalledWith({
                searchParams: {
                    searchName: "",
                    status: [],
                    sort: "createdAt",
                    isAscending: false,
                },
                limit: 20,
                offset: 0,
            })
        },
    )

    it("enables bulk status editing after selecting all orders", async () => {
        const order = orderSummaryFactory({ id: 42 })
        vi.spyOn(server.orders, "adminSearch")
            .mockResolvedValue({ orders: [order], hasMore: false })
        const user = userEvent.setup()

        renderWithRouter(<OrdersPage />, {
            path: "/admin/orders",
            initialPath: "/admin/orders",
        })

        await screen.findByText("Order #42")
        await user.click(screen.getByLabelText("Select all"))

        expect(screen.getByRole("button", {
            name: "Update selected",
        })).toBeEnabled()
    })

    it("offers another page when the server reports more orders", async () => {
        const order = orderSummaryFactory({ id: 43 })
        vi.spyOn(server.orders, "adminSearch")
            .mockResolvedValue({ orders: [order], hasMore: true })

        renderWithRouter(<OrdersPage />, {
            path: "/admin/orders",
            initialPath: "/admin/orders",
        })

        await screen.findByText("Order #43")
        expect(await screen.findByRole("button", {
            name: "Load more content",
        })).toBeInTheDocument()
    })
})
