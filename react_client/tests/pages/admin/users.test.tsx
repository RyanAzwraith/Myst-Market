import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../utils"
import { userAnalyticsFactory } from "../../../mock_data/user"
import { server } from "@/core"
import { UsersPage } from "@/pages/admin/users"

describe("UsersPage intimacy: high", () => {
    it("functionality renders user results and search controls", async () => {
        const user = userAnalyticsFactory({
            id: 71,
            name: "Admin User",
            email: "admin-user@example.com",
            isRegistered: true,
            orderCount: 4,
            reviewCount: 2,
        })
        const adminSearch = vi.spyOn(server.users, "adminSearch")
            .mockResolvedValue({
                users: [user],
                hasMore: false,
            })

        renderWithRouter(<UsersPage />, {
            path: "/admin/users",
            initialPath: "/admin/users",
        })

        expect(await screen.findByText("Admin User"))
            .toBeInTheDocument()
        expect(screen.getByText("admin-user@example.com"))
            .toBeInTheDocument()
        expect(screen.getByText(/Registered.*orders/))
            .toBeInTheDocument()
        expect(screen.getByText("All Users")).toBeInTheDocument()
        expect(adminSearch).toHaveBeenCalledWith({
            searchParams: {
                registration: [],
                sortBy: "createdAt",
                search: "",
                isAscending: false,
            },
            limit: 20,
            offset: 0,
        })
    })

    it("opens user analytics from a user result", async () => {
        const user = userAnalyticsFactory({
            id: 72,
            name: "Analytics User",
            email: "analytics@example.com",
            createdAt: "2026-07-01",
            orderCount: 6,
            reviewCount: 3,
        })
        vi.spyOn(server.users, "adminSearch")
            .mockResolvedValue({
                users: [user],
                hasMore: false,
            })
        const userActions = userEvent.setup()

        renderWithRouter(<UsersPage />, {
            path: "/admin/users",
            initialPath: "/admin/users",
        })

        await userActions.click(await screen.findByText("Analytics User"))

        expect(screen.getByRole("dialog", { name: "Modal" }))
            .toBeInTheDocument()
        expect(screen.getByText("ID: 72")).toBeInTheDocument()
        expect(screen.getByText("Name: Analytics User"))
            .toBeInTheDocument()
        expect(screen.getByText("Created at: 2026-07-01"))
            .toBeInTheDocument()
        expect(screen.getByText("Order Count: 6"))
            .toBeInTheDocument()
    })

    it("loads another page when the server reports more users", async () => {
        const firstUser = userAnalyticsFactory({
            id: 73,
            name: "First User",
        })
        const secondUser = userAnalyticsFactory({
            id: 74,
            name: "Second User",
        })
        const adminSearch = vi.spyOn(server.users, "adminSearch")
            .mockResolvedValueOnce({
                users: [firstUser],
                hasMore: true,
            })
            .mockResolvedValueOnce({
                users: [secondUser],
                hasMore: false,
            })
        const userActions = userEvent.setup()

        renderWithRouter(<UsersPage />, {
            path: "/admin/users",
            initialPath: "/admin/users",
        })

        await screen.findByText("First User")
        await userActions.click(screen.getByRole("button", {
            name: "Load more content",
        }))

        expect(await screen.findByText("Second User"))
            .toBeInTheDocument()
        await waitFor(() => expect(adminSearch)
            .toHaveBeenNthCalledWith(2, {
                searchParams: {
                    registration: [],
                    sortBy: "createdAt",
                    search: "",
                    isAscending: false,
                },
                limit: 20,
                offset: 20,
            }))
    })
})
