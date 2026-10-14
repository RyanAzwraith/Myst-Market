import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../utils"
import { performance } from "../../../mock_data/app"
import { orderFactory } from "../../../mock_data/order"
import { productAnalyticsFactory } from "../../../mock_data/product"
import { server } from "@/core"
import { DashboardPage } from "@/pages/admin/dashboard"

describe("DashboardPage intimacy: high", () => {
    it("functionality renders dashboard metrics and summaries", async () => {
        const recentOrder = orderFactory({
            id: 101,
            costAudCent: 2400,
            status: "processing",
        })
        const topProduct = productAnalyticsFactory({
            id: 202,
            name: "Top Relic",
            orderCount: 37,
        })
        const retrievePerformance = vi.spyOn(
            server.app,
            "retrievePerformance",
        ).mockResolvedValue({
            performance: {
                ...performance,
                orders: 12,
                newCustomers: 8,
                revenue: 15000,
                revenueLost: 2000,
                previousRevenue: 10000,
                previousOrders: 10,
                previousNewCustomers: 8,
                previousRevenueLost: 4000,
            },
        })
        const getGraph = vi.spyOn(server.app, "getGraph")
            .mockResolvedValue({
                graphPoints: [
                    { month: "January", revenue: 12000, orders: 8 },
                ],
            })
        const getAttention = vi.spyOn(server.app, "getAttention")
            .mockResolvedValue({
                attention: {
                    pendingOrders: 3,
                    outOfStockProducts: 4,
                    salesEnding: 2,
                },
            })
        const getRecent = vi.spyOn(server.orders, "getRecent")
            .mockResolvedValue({ orders: [recentOrder] })
        const retrieveTop = vi.spyOn(
            server.products,
            "retrieveMostSoldProducts",
        ).mockResolvedValue({
            products: [topProduct],
            images: [],
        })

        renderWithRouter(<DashboardPage />, {
            path: "/admin/dashboard",
            initialPath: "/admin/dashboard",
        })

        expect(screen.getByRole("heading", {
            name: "Admin Dashboard",
        })).toBeInTheDocument()
        expect(await screen.findByRole("heading", {
            name: "Performance",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Revenue / Orders",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Requires Attention",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Recent Orders",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Top Products",
        })).toBeInTheDocument()
        expect(screen.getByText("3 orders pending"))
            .toBeInTheDocument()
        expect(screen.getByText("4 out of stock products"))
            .toBeInTheDocument()
        expect(screen.getByText("2 sales ending")).toBeInTheDocument()
        expect(screen.getByText("Top Relic")).toBeInTheDocument()
        expect(screen.getByText("37")).toBeInTheDocument()
        expect(screen.getByText("processing")).toBeInTheDocument()

        await waitFor(() => {
            expect(retrievePerformance).toHaveBeenCalledOnce()
            expect(getGraph).toHaveBeenCalledOnce()
            expect(getAttention).toHaveBeenCalledOnce()
            expect(getRecent).toHaveBeenCalledOnce()
            expect(retrieveTop).toHaveBeenCalledWith({ limit: 3 })
        })
    })

    it("shows loading sections while dashboard data is unavailable", () => {
        vi.spyOn(server.app, "retrievePerformance")
            .mockReturnValue(new Promise(() => {}))
        vi.spyOn(server.app, "getGraph")
            .mockReturnValue(new Promise(() => {}))
        vi.spyOn(server.app, "getAttention")
            .mockReturnValue(new Promise(() => {}))
        vi.spyOn(server.orders, "getRecent")
            .mockReturnValue(new Promise(() => {}))
        vi.spyOn(server.products, "retrieveMostSoldProducts")
            .mockReturnValue(new Promise(() => {}))

        renderWithRouter(<DashboardPage />, {
            path: "/admin/dashboard",
            initialPath: "/admin/dashboard",
        })

        expect(screen.getAllByText("Loading...")).toHaveLength(5)
    })
})
