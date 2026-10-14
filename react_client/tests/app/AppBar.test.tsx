import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { AppBar } from "@/app/AppBar"
import { userFactory } from "../../mock_data/user"
import {
    renderWithRouter,
    resetAuthState,
    resetCartState,
} from "../utils"

describe("AppBar intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
        resetCartState([])
    })

    it("functionality renders the guest navigation", () => {
        renderWithRouter(<AppBar />, {
            path: "*",
            initialPath: "/catalogue",
        })

        expect(screen.getByRole("heading", {
            name: "Myst Market",
        })).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Search products..."))
            .toBeInTheDocument()
        expect(screen.queryByLabelText("Admin Mode"))
            .not.toBeInTheDocument()
    })

    it("renders admin navigation for an administrator", async () => {
        resetAuthState({
            accessToken: "admin-token",
            user: userFactory({ isAdmin: true }),
        })

        renderWithRouter(<AppBar />, {
            path: "*",
            initialPath: "/admin/dashboard",
        })

        expect(await screen.findByRole("button", {
            name: "Dashboard",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Orders",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Products",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Sales",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Users",
        })).toBeInTheDocument()
        expect(screen.getByLabelText("Admin Mode"))
            .toBeChecked()
    })

    it("navigates to an admin page from the admin navigation", async () => {
        resetAuthState({
            accessToken: "admin-token",
            user: userFactory({ isAdmin: true }),
        })
        const user = userEvent.setup()

        renderWithRouter(<AppBar />, {
            path: "*",
            initialPath: "/admin/dashboard",
        })

        await user.click(await screen.findByRole("button", {
            name: "Orders",
        }))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/admin/orders")
    })

    it("leaves admin mode and navigates to the catalogue", async () => {
        resetAuthState({
            accessToken: "admin-token",
            user: userFactory({ isAdmin: true }),
        })
        const user = userEvent.setup()

        renderWithRouter(<AppBar />, {
            path: "*",
            initialPath: "/admin/dashboard",
        })

        await user.click(await screen.findByLabelText("Admin Mode"))

        await waitFor(() => {
            expect(screen.getByTestId("location"))
                .toHaveTextContent("/catalogue")
        })
        expect(screen.queryByRole("button", { name: "Dashboard" }))
            .not.toBeInTheDocument()
    })
})