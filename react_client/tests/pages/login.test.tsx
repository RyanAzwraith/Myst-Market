import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../utils"
import { mockAccessToken } from "../../mock_data/auth"
import { userFactory } from "../../mock_data/user"
import { server } from "@/core"
import { useAuthState } from "@/features/auth/state"
import { LoginPage } from "@/pages/login"

describe("LoginPage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the login page", () => {
        renderWithRouter(<LoginPage />, {
            path: "/login",
            initialPath: "/login",
        })

        expect(screen.getByRole("heading", { name: "Sign in" }))
            .toBeInTheDocument()
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Password"))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Login" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Register" }))
            .toBeInTheDocument()
    })

    it("navigates to registration when Register is selected", async () => {
        const user = userEvent.setup()

        renderWithRouter(<LoginPage />, {
            path: "/login",
            initialPath: "/login",
        })

        await user.click(screen.getByRole("button", { name: "Register" }))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/register")
    })

    it("logs in and navigates to the profile", async () => {
        const account = userFactory({ email: "adventurer@example.com" })
        const login = vi.spyOn(server.auth, "login")
            .mockResolvedValue({
                accessToken: mockAccessToken,
                user: account,
            })
        const user = userEvent.setup()

        renderWithRouter(<LoginPage />, {
            path: "/login",
            initialPath: "/login",
        })

        await user.type(
            screen.getByPlaceholderText("Email"),
            account.email,
        )
        await user.type(
            screen.getByPlaceholderText("Password"),
            "secret-password",
        )
        await user.click(screen.getByRole("button", { name: "Login" }))

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith({
                login: {
                    email: account.email,
                    password: "secret-password",
                },
            })
            expect(screen.getByTestId("location"))
                .toHaveTextContent("/profile")
        })
        expect(useAuthState.getState().user).toBe(account)
    })
})
