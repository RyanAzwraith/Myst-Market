import { screen } from "@testing-library/react"
import { describe, expect, it, beforeEach, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../../../utils"
import { mockAccessToken } from "../../../../mock_data/auth"
import { userFactory } from "../../../../mock_data/user"
import { LoggedInLoader } from "@/features/auth/components/loader"
import type { User } from "@/features/auth"
import { useAuthState } from "@/features/auth/state"

describe("LoggedInLoader intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the authenticated user", () => {
        const user = userFactory({ email: "customer@example.com" })
        const renderUser = vi.fn((currentUser: User | null) => (
            <div>{currentUser?.email}</div>
        ))
        useAuthState.getState().login(mockAccessToken, user)

        renderWithRouter(<LoggedInLoader render={renderUser} />)

        expect(screen.getByText("customer@example.com"))
            .toBeInTheDocument()
        expect(renderUser).toHaveBeenCalledWith(user)
    })

    it("passes null to the renderer when the user is logged out", () => {
        const renderUser = vi.fn((currentUser: User | null) => (
            <div>{currentUser ? currentUser.email : "Sign in"}</div>
        ))

        renderWithRouter(<LoggedInLoader render={renderUser} />)

        expect(screen.getByText("Sign in")).toBeInTheDocument()
        expect(renderUser).toHaveBeenCalledWith(null)
    })
})
