import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper, resetAuthState } from "../../utils"
import { server } from "@/core"
import { useLoginFormInputs } from "@/features/auth/hooks"

describe("useLoginFormInputs intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality submits credentials and calls onSuccess", async () => {
        const login = vi.spyOn(server.auth, "login")
            .mockResolvedValue({
                accessToken: "login-token",
                user: {
                    id: 1,
                    email: "customer@example.com",
                    name: "Customer",
                    isAdmin: false,
                },
            })
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginFormInputs({ onSuccess }),
            { wrapper },
        )

        act(() => {
            result.current.bindings.email.set("customer@example.com")
            result.current.bindings.password.set("password")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(login).toHaveBeenCalledWith({
            login: {
                email: "customer@example.com",
                password: "password",
            },
        }))
        expect(onSuccess).toHaveBeenCalledOnce()
        expect(result.current.values).toEqual({
            email: null,
            password: null,
        })
    })

    it("rejects an invalid email before submitting", () => {
        const login = vi.spyOn(server.auth, "login").mockReturnValue(
            new Promise(() => {}),
        )
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginFormInputs({}),
            { wrapper },
        )

        act(() => {
            result.current.bindings.email.set("not-an-email")
            result.current.bindings.password.set("password")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg).toBe("Invalid email")
        expect(login).not.toHaveBeenCalled()
    })

    it("requires a password before submitting", () => {
        const login = vi.spyOn(server.auth, "login").mockReturnValue(
            new Promise(() => {}),
        )
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginFormInputs({}),
            { wrapper },
        )

        act(() => {
            result.current.bindings.email.set("customer@example.com")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg).toBe("Password required")
        expect(login).not.toHaveBeenCalled()
    })

    it("exposes the server error through the form state", async () => {
        const error = new Error("Invalid credentials")
        const login = vi.spyOn(server.auth, "login")
            .mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useLoginFormInputs({}),
            { wrapper },
        )

        act(() => {
            result.current.bindings.email.set("customer@example.com")
            result.current.bindings.password.set("wrong")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(result.current.errorMsg)
            .toBe("Invalid credentials"))
        expect(login).toHaveBeenCalledOnce()
    })
})
