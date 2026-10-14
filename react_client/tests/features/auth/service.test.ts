import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper, resetAuthState } from "../../utils"
import { mockAccessToken } from "../../../mock_data/auth"
import { userFactory } from "../../../mock_data/user"
import { server } from "@/core"
import {
    useLoginMutation,
    useLogoutMutation,
    useRefreshMutation,
} from "@/features/auth/service"
import { useAuthState } from "@/features/auth/state"

describe("useLoginMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality logs in through the server and stores credentials",
        async () => {
            const user = userFactory()
            const login = vi.spyOn(server.auth, "login")
                .mockResolvedValue({
                    accessToken: mockAccessToken,
                    user,
                })
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useLoginMutation({}),
                { wrapper },
            )
            const credentials = {
                email: user.email,
                password: "password",
            }

            await result.current.mutateAsync(credentials)

            expect(login).toHaveBeenCalledWith({ login: credentials })
            expect(useAuthState.getState().accessToken)
                .toBe(mockAccessToken)
            expect(useAuthState.getState().user).toBe(user)
        },
    )

    it("calls the success callback after updating auth state", async () => {
        const user = userFactory()
        const onSuccess = vi.fn()
        vi.spyOn(server.auth, "login").mockResolvedValue({
            accessToken: mockAccessToken,
            user,
        })
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginMutation({ onSuccess }),
            { wrapper },
        )

        await result.current.mutateAsync({
            email: user.email,
            password: "password",
        })

        expect(onSuccess).toHaveBeenCalledOnce()
        expect(useAuthState.getState().user).toBe(user)
    })

    it("calls the error callback and leaves the session unchanged", async () => {
        const error = new Error("Invalid credentials")
        const onError = vi.fn()
        vi.spyOn(server.auth, "login").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginMutation({ onError }),
            { wrapper },
        )

        await expect(result.current.mutateAsync({
            email: "customer@example.com",
            password: "wrong",
        })).rejects.toBe(error)

        expect(onError).toHaveBeenCalledOnce()
        expect(useAuthState.getState().accessToken).toBeNull()
        expect(useAuthState.getState().user).toBeNull()
    })
})

describe("useLogoutMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality logs out through the server and clears auth state",
        async () => {
            const user = userFactory()
            useAuthState.getState().login(mockAccessToken, user)
            const logout = vi.spyOn(server.auth, "logout")
                .mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useLogoutMutation({}),
                { wrapper },
            )

            await result.current.mutateAsync()

            expect(logout).toHaveBeenCalledOnce()
            expect(useAuthState.getState().accessToken).toBeNull()
            expect(useAuthState.getState().user).toBeNull()
        },
    )

    it("calls the success callback after the server confirms logout",
        async () => {
            const user = userFactory()
            useAuthState.getState().login(mockAccessToken, user)
            const onSuccess = vi.fn()
            vi.spyOn(server.auth, "logout").mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useLogoutMutation({ onSuccess }),
                { wrapper },
            )

            await result.current.mutateAsync()

            expect(onSuccess).toHaveBeenCalledOnce()
            expect(useAuthState.getState().isLoggedIn()).toBe(false)
        },
    )

    it("calls the error callback and keeps the session active", async () => {
        const user = userFactory()
        useAuthState.getState().login(mockAccessToken, user)
        const error = new Error("Logout failed")
        const onError = vi.fn()
        vi.spyOn(server.auth, "logout").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLogoutMutation({ onError }),
            { wrapper },
        )

        await expect(result.current.mutateAsync()).rejects.toBe(error)

        expect(onError).toHaveBeenCalledOnce()
        expect(useAuthState.getState().accessToken)
            .toBe(mockAccessToken)
        expect(useAuthState.getState().user).toBe(user)
    })
})

describe("useRefreshMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality refreshes the access token through the server",
        async () => {
            const user = userFactory()
            useAuthState.getState().login("old-token", user)
            const refresh = vi.spyOn(server.auth, "refresh")
                .mockResolvedValue({ accessToken: mockAccessToken })
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useRefreshMutation({}),
                { wrapper },
            )

            await result.current.mutateAsync()

            expect(refresh).toHaveBeenCalledOnce()
            expect(useAuthState.getState().accessToken)
                .toBe(mockAccessToken)
            expect(useAuthState.getState().user).toBe(user)
        },
    )

    it("calls the success callback after saving the refreshed token",
        async () => {
            const onSuccess = vi.fn()
            vi.spyOn(server.auth, "refresh")
                .mockResolvedValue({ accessToken: "refreshed-token" })
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useRefreshMutation({ onSuccess }),
                { wrapper },
            )

            await result.current.mutateAsync()

            expect(onSuccess).toHaveBeenCalledOnce()
            expect(useAuthState.getState().accessToken)
                .toBe("refreshed-token")
        },
    )

    it("calls the error callback when refreshing the token fails", async () => {
        const error = new Error("Refresh failed")
        const onError = vi.fn()
        vi.spyOn(server.auth, "refresh").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useRefreshMutation({ onError }),
            { wrapper },
        )

        await expect(result.current.mutateAsync()).rejects.toBe(error)

        expect(onError).toHaveBeenCalledOnce()
    })
})
