import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { orderSummaryFactory } from "../../../../mock_data/order"
import { reviewFactory } from "../../../../mock_data/review"
import { userAnalyticsFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    AdminSearchLoader,
    OrdersLoader,
    ReviewsLoader,
} from "@/features/user/components/loader"

describe("AdminSearchLoader intimacy: high", () => {
    it("functionality passes loaded users and query state to the renderer",
        async () => {
            const user = userAnalyticsFactory({ name: "Loaded User" })
            const adminSearch = vi.spyOn(server.users, "adminSearch")
                .mockResolvedValue({
                    users: [user],
                    hasMore: false,
                })
            const renderLoader = vi.fn(({ users }) => (
                <div>{users.map(item => item.name).join(", ")}</div>
            ))

            renderWithRouter(
                <AdminSearchLoader render={renderLoader} limit={5} />,
                { initialPath: "/admin/users" },
            )

            expect(await screen.findByText("Loaded User"))
                .toBeInTheDocument()
            expect(adminSearch).toHaveBeenCalledWith({
                searchParams: {
                    registration: [],
                    sortBy: "createdAt",
                    search: "",
                    isAscending: false,
                },
                limit: 5,
                offset: 0,
            })
            expect(renderLoader).toHaveBeenCalledWith(
                expect.objectContaining({ users: [user] }),
            )
        },
    )
})

describe("ReviewsLoader intimacy: medium", () => {
    it("functionality passes loaded reviews to the renderer", async () => {
        const reviews = [reviewFactory({ description: "Great item" })]
        vi.spyOn(server.user, "getReviews").mockResolvedValue({ reviews })
        const renderLoader = vi.fn(({ reviews: loadedReviews }) => (
            <div>{loadedReviews[0].description}</div>
        ))

        renderWithRouter(<ReviewsLoader render={renderLoader} />)

        expect(await screen.findByText("Great item")).toBeInTheDocument()
        expect(renderLoader).toHaveBeenCalledWith({ reviews })
    })

    it("shows loading while reviews are unavailable", () => {
        vi.spyOn(server.user, "getReviews").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<ReviewsLoader render={vi.fn()} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("OrdersLoader intimacy: medium", () => {
    it("functionality passes loaded orders to the renderer", async () => {
        const orders = [orderSummaryFactory({ id: 8 })]
        vi.spyOn(server.user, "getOrders").mockResolvedValue({ orders })
        const renderLoader = vi.fn(({ orders: loadedOrders }) => (
            <div>{loadedOrders[0].id}</div>
        ))

        renderWithRouter(<OrdersLoader render={renderLoader} />)

        expect(await screen.findByText("8")).toBeInTheDocument()
        expect(renderLoader).toHaveBeenCalledWith({ orders })
    })

    it("shows loading while orders are unavailable", () => {
        vi.spyOn(server.user, "getOrders").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<OrdersLoader render={vi.fn()} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
