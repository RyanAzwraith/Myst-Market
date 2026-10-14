import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../utils"
import { mockAccessToken } from "../../mock_data/auth"
import { userFactory } from "../../mock_data/user"
import { server } from "@/core"
import { useAuthState } from "@/features/auth/state"
import { SetPasswordPage } from "@/pages/setPassword"

describe("SetPasswordPage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the set-password page", () => {
        renderWithRouter(<SetPasswordPage />, {
            path: "/set-password",
            initialPath: "/set-password",
        })

        expect(screen.getByRole("heading", { name: "Set Password" }))
            .toBeInTheDocument()
        expect(screen.getByLabelText("Password")).toBeInTheDocument()
        expect(screen.getByLabelText("Re-enter Password"))
            .toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Send set password email",
        })).toBeInTheDocument()
    })

    it("updates credentials and navigates to the profile", async () => {
        const account = userFactory({ email: "updated@example.com" })
        const patchPassword = vi.spyOn(server.user, "patchPassword")
            .mockResolvedValue({
                accessToken: mockAccessToken,
                user: account,
            })
        const user = userEvent.setup()

        renderWithRouter(<SetPasswordPage />, {
            path: "/set-password",
            initialPath: "/set-password",
        })

        await user.type(
            screen.getByLabelText("Password"),
            "new-password",
        )
        await user.type(
            screen.getByLabelText("Re-enter Password"),
            "new-password",
        )
        await user.click(screen.getByRole("button", {
            name: "Send set password email",
        }))

        await waitFor(() => {
            expect(patchPassword).toHaveBeenCalledWith({
                password: "new-password",
            })
            expect(screen.getByTestId("location"))
                .toHaveTextContent("/profile")
        })
        expect(useAuthState.getState().accessToken)
            .toBe(mockAccessToken)
        expect(useAuthState.getState().user).toBe(account)
    })
})
