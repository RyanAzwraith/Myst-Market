import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../utils"
import { server } from "@/core"
import { RegisterPage } from "@/pages/register"

describe("RegisterPage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the registration page", () => {
        renderWithRouter(<RegisterPage />, {
            path: "/register",
            initialPath: "/register",
        })

        expect(screen.getByRole("heading", { name: "Register" }))
            .toBeInTheDocument()
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Send set password email",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Login" }))
            .toBeInTheDocument()
    })

    it("navigates to login when Login is selected", async () => {
        const user = userEvent.setup()

        renderWithRouter(<RegisterPage />, {
            path: "/register",
            initialPath: "/register",
        })

        await user.click(screen.getByRole("button", { name: "Login" }))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/login")
    })

    it("submits registration details and navigates to login", async () => {
        const create = vi.spyOn(server.user, "create")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<RegisterPage />, {
            path: "/register",
            initialPath: "/register",
        })

        await user.type(
            screen.getByPlaceholderText("Name"),
            "New Adventurer",
        )
        await user.type(
            screen.getByPlaceholderText("Email"),
            "new@example.com",
        )
        await user.click(screen.getByRole("button", {
            name: "Send set password email",
        }))

        await waitFor(() => {
            expect(create).toHaveBeenCalledWith({
                userInput: {
                    name: "New Adventurer",
                    email: "new@example.com",
                },
            })
            expect(screen.getByTestId("location"))
                .toHaveTextContent("/login")
        })
    })
})
