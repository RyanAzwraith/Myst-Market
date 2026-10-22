import { waitFor, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { server } from "@/core"
import {
    AttentionInfo,
    Graph,
    Metric,
    PerformanceDisplay,
    StatsInfo,
} from "@/features/app/components/content"

describe("StatsInfo intimacy: medium", () => {
    it("functionality renders statistics and average rating", async () => {
        vi.spyOn(server.app, "getStats").mockResolvedValue({
            stats: {
                productCount: 42,
                customerCount: 18,
                totalAverageRating: 4.2,
            },
        })

        renderWithRouter(<StatsInfo />)

        expect(await screen.findByText("42")).toBeInTheDocument()
        expect(screen.getByText("18")).toBeInTheDocument()
        expect(screen.getByText("4.2")).toBeInTheDocument()
        expect(screen.getByText("Items discovered")).toBeInTheDocument()
        expect(screen.getByText("Adventurers served")).toBeInTheDocument()
        expect(screen.getByText("Average rating")).toBeInTheDocument()
        expect(screen.getAllByLabelText("StarSolidIcon")).toHaveLength(4)
        expect(screen.getAllByLabelText("StarOutlineIcon")).toHaveLength(1)
    })

    it("shows loading while statistics are unavailable", () => {
        vi.spyOn(server.app, "getStats").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<StatsInfo />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("Graph intimacy: medium", () => {
    it("functionality renders after graph data is loaded", async () => {
        const getGraph = vi.spyOn(server.app, "getGraph")
            .mockResolvedValue({
                graphPoints: [
                    { month: "January", revenue: 12000, orders: 8 },
                    { month: "February", revenue: 18000, orders: 11 },
                ],
            })

        renderWithRouter(<Graph />)

        await waitFor(() => {
            expect(getGraph).toHaveBeenCalledOnce()
            expect(screen.queryByText("Loading..."))
                .not.toBeInTheDocument()
        })
    })

    it("shows loading while graph data is unavailable", () => {
        vi.spyOn(server.app, "getGraph").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<Graph />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("AttentionInfo intimacy: medium", () => {
    it("functionality renders all attention counts", async () => {
        vi.spyOn(server.app, "getAttention").mockResolvedValue({
            attention: {
                pendingOrders: 3,
                outOfStockProducts: 5,
                salesEnding: 2,
            },
        })

        renderWithRouter(<AttentionInfo />)

        expect(await screen.findByText("3 orders pending"))
            .toBeInTheDocument()
        expect(screen.getByText("5 out of stock products"))
            .toBeInTheDocument()
        expect(screen.getByText("2 sales ending")).toBeInTheDocument()
    })

    it("shows loading while attention data is unavailable", () => {
        vi.spyOn(server.app, "getAttention").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<AttentionInfo />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("PerformanceDisplay intimacy: low", () => {
    it("functionality renders all performance metrics", () => {
        renderWithRouter(
            <PerformanceDisplay
                performance={{
                    periodDays: 30,
                    revenue: 15000,
                    orders: 12,
                    newCustomers: 10,
                    revenueLost: 2000,
                    previousRevenue: 10000,
                    previousOrders: 8,
                    previousNewCustomers: 10,
                    previousRevenueLost: 4000,
                }}
            />,
        )

        expect(screen.getByText("Revenue")).toBeInTheDocument()
        expect(screen.getByText("$ 150")).toBeInTheDocument()
        expect(screen.getByText("Orders")).toBeInTheDocument()
        expect(screen.getByText("12")).toBeInTheDocument()
        expect(screen.getByText("New Customers")).toBeInTheDocument()
        expect(screen.getByText("10")).toBeInTheDocument()
        expect(screen.getByText("Revenue Lost")).toBeInTheDocument()
        expect(screen.getByText("$ 20")).toBeInTheDocument()
        expect(screen.getAllByText("50%")).toHaveLength(2)
        expect(screen.getByText("0%")).toBeInTheDocument()
        expect(screen.getByText("-50%")).toBeInTheDocument()
    })
})

describe("Metric intimacy: low", () => {
    it("functionality renders a positive percentage change", () => {
        renderWithRouter(
            <Metric
                label="Revenue"
                value="$ 100"
                current={150}
                previous={100}
            />,
        )

        expect(screen.getByText("Revenue")).toBeInTheDocument()
        expect(screen.getByText("$ 100")).toBeInTheDocument()
        expect(screen.getByText("50%")).toBeInTheDocument()
    })

    it("uses zero change when current and previous values are zero", () => {
        renderWithRouter(
            <Metric
                label="Orders"
                value={0}
                current={0}
                previous={0}
            />,
        )

        expect(screen.getByText("0")).toBeInTheDocument()
        expect(screen.getByText("0%")).toBeInTheDocument()
    })

    it("uses a 100 percent increase when there is no previous value", () => {
        renderWithRouter(
            <Metric
                label="Customers"
                value={4}
                current={4}
                previous={0}
            />,
        )

        expect(screen.getByText("100%")).toBeInTheDocument()
    })
})
