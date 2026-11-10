import { beforeEach, describe, expect, it } from "vitest"

import { resetAuthState } from "../../utils"
import { mockAccessToken } from "../../../mock_data/auth"
import { userFactory } from "../../../mock_data/user"
import { useAuthState } from "@/features/auth/state"

describe("useAuthState intimacy: low", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality logs in and reports the authenticated user", () => {
        const user = userFactory({ email: "customer@example.com" })

        useAuthState.getState().login(mockAccessToken, user)

        expect(useAuthState.getState().accessToken)
            .toBe(mockAccessToken)
        expect(useAuthState.getState().user).toBe(user)
        expect(useAuthState.getState().isLoggedIn()).toBe(true)
    })

    it("logs out and clears the user session", () => {
        const user = userFactory()
        useAuthState.getState().login(mockAccessToken, user)

        useAuthState.getState().logout()

        expect(useAuthState.getState().accessToken).toBeNull()
        expect(useAuthState.getState().user).toBeNull()
        expect(useAuthState.getState().isLoggedIn()).toBe(false)
    })

    it("refreshes the token without replacing the current user", () => {
        const user = userFactory()
        useAuthState.getState().login("old-token", user)

        useAuthState.getState().refresh("new-token")

        expect(useAuthState.getState().accessToken).toBe("new-token")
        expect(useAuthState.getState().user).toBe(user)
        expect(useAuthState.getState().isLoggedIn()).toBe(true)
    })

    it("persists the user but does not persist the access token", () => {
        const user = userFactory({ email: "persisted@example.com" })

        useAuthState.getState().login("private-token", user)

        const persisted = localStorage.getItem("auth-storage")
        expect(persisted).toContain(user.email)
        expect(persisted).not.toContain("private-token")
    })
})
