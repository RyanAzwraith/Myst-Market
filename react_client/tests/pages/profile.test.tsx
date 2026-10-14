import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetAuthState,
} from "../utils"
import { mockAccessToken } from "../../mock_data/auth"
import { orderSummaryFactory } from "../../mock_data/order"
import { reviewFactory } from "../../mock_data/review"
import { userFactory } from "../../mock_data/user"
import { server } from "@/core"
import { useAuthState } from "@/features/auth/state"
import { ProfilePage } from "@/pages/profile"

describe("ProfilePage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders profile data, orders, and reviews",
        async () => {
            const account = userFactory({
                name: "Current Adventurer",
                email: "current@example.com",
            })
            const orders = [orderSummaryFactory({
                id: 14,
                createdAt: "2026-06-01",
                totalCent: 3200,
            })]
            const reviews = [reviewFactory({
                id: 6,
                productSlug: "ancient-amulet",
                userName: "Current Adventurer",
                description: "A dependable magical artifact.",
            })]
            useAuthState.getState().login(mockAccessToken, account)
            const getOrders = vi.spyOn(server.user, "getOrders")
                .mockResolvedValue({ orders })
            const getReviews = vi.spyOn(server.user, "getReviews")
                .mockResolvedValue({ reviews })

            renderWithRouter(<ProfilePage />, {
                path: "/profile",
                initialPath: "/profile",
            })

            expect(screen.getByRole("heading", { name: "Profile" }))
                .toBeInTheDocument()
            expect(screen.getByPlaceholderText("Name"))
                .toHaveValue("Current Adventurer")
            expect(screen.getByPlaceholderText("Email"))
                .toHaveValue("current@example.com")
            expect(screen.getByRole("button", { name: "Logout" }))
                .toBeInTheDocument()
            expect(screen.getByRole("button", {
                name: "Set password with email",
            })).toBeInTheDocument()
            expect(screen.getByRole("button", {
                name: /Delete Profile/,
            })).toBeInTheDocument()
            expect(screen.getByRole("heading", { name: "Orders" }))
                .toBeInTheDocument()
            expect(screen.getByRole("heading", { name: "Reviews" }))
                .toBeInTheDocument()
            expect(await screen.findByText("2026-06-01"))
                .toBeInTheDocument()
            expect(screen.getByText("A dependable magical artifact."))
                .toBeInTheDocument()

            await waitFor(() => {
                expect(getOrders).toHaveBeenCalledOnce()
                expect(getReviews).toHaveBeenCalledOnce()
            })
        },
    )

    it("logs out and navigates to login", async () => {
        const account = userFactory()
        useAuthState.getState().login(mockAccessToken, account)
        vi.spyOn(server.user, "getOrders")
            .mockResolvedValue({ orders: [] })
        vi.spyOn(server.user, "getReviews")
            .mockResolvedValue({ reviews: [] })
        const logout = vi.spyOn(server.auth, "logout")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<ProfilePage />, {
            path: "/profile",
            initialPath: "/profile",
        })

        await user.click(screen.getByRole("button", { name: "Logout" }))

        await waitFor(() => {
            expect(logout).toHaveBeenCalledOnce()
            expect(screen.getByTestId("location"))
                .toHaveTextContent("/login")
        })
        expect(useAuthState.getState().isLoggedIn()).toBe(false)
    })

    it("navigates to an order when an order card is selected", async () => {
        const account = userFactory()
        const order = orderSummaryFactory({
            id: 18,
            createdAt: "2026-06-02",
        })
        useAuthState.getState().login(mockAccessToken, account)
        vi.spyOn(server.user, "getOrders")
            .mockResolvedValue({ orders: [order] })
        vi.spyOn(server.user, "getReviews")
            .mockResolvedValue({ reviews: [] })
        const user = userEvent.setup()

        renderWithRouter(<ProfilePage />, {
            path: "/profile",
            initialPath: "/profile",
        })

        await screen.findByText("2026-06-02")
        await user.click(screen.getByText("2026-06-02"))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/order/18")
    })

    it("navigates to a product when a review is selected", async () => {
        const account = userFactory()
        const review = reviewFactory({
            productSlug: "reviewed-relic",
            description: "This relic is worth keeping.",
        })
        useAuthState.getState().login(mockAccessToken, account)
        vi.spyOn(server.user, "getOrders")
            .mockResolvedValue({ orders: [] })
        vi.spyOn(server.user, "getReviews")
            .mockResolvedValue({ reviews: [review] })
        const user = userEvent.setup()

        renderWithRouter(<ProfilePage />, {
            path: "/profile",
            initialPath: "/profile",
        })

        await screen.findByText("This relic is worth keeping.")
        await user.click(screen.getByText("This relic is worth keeping."))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/product/reviewed-relic")
    })
})
