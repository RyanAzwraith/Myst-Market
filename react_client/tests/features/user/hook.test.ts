import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper, resetAuthState } from "../../utils"
import { userFactory } from "../../../mock_data/user"
import { ServerException, server } from "@/core"
import {
    userFields,
    useAdminSearchParams,
    useRegisterFormInputs,
    useSetPasswordFormInputs,
    useUpdateFormInputs,
} from "@/features/user/hook"
import { useAuthState } from "@/features/auth/state"

describe("userFields intimacy: low", () => {
    it("functionality defines user fields and name validation", () => {
        const fields = userFields()

        expect(fields.name.label).toBe("Name")
        expect(fields.name.placeholder).toBe("Name")
        expect(fields.name.validate?.(null)).toBe("Name required")
        expect(fields.name.validate?.("Customer")).toBeNull()
        expect(fields.email.label).toBe("Email")
        expect(fields.email.placeholder).toBe("Email")
    })

    it("initializes fields from an existing user summary", () => {
        const user = userFactory({
            name: "Existing Customer",
            email: "existing@example.com",
        })

        const fields = userFields(user)

        expect(fields.name.initial).toBe(user.name)
        expect(fields.email.initial).toBe(user.email)
    })
})

describe("useRegisterFormInputs intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality submits user details and calls onSuccess", async () => {
        const create = vi.spyOn(server.user, "create")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useRegisterFormInputs({ onSuccess }),
            { wrapper },
        )

        act(() => {
            result.current.bindings.name.set("New Customer")
            result.current.bindings.email.set("new@example.com")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(create).toHaveBeenCalledWith({
            userInput: {
                name: "New Customer",
                email: "new@example.com",
            },
        }))
        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("shows a server validation error", async () => {
        const error = new ServerException({
            message: "Email already registered",
        })
        vi.spyOn(server.user, "create").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useRegisterFormInputs({}),
            { wrapper },
        )

        act(() => {
            result.current.bindings.name.set("Existing Customer")
            result.current.bindings.email.set("existing@example.com")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(result.current.errorMsg)
            .toBe("Email already registered"))
    })
})

describe("useUpdateFormInputs intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality initializes from and updates the current user",
        async () => {
            const currentUser = userFactory({
                name: "Current Name",
                email: "current@example.com",
            })
            const updatedUser = userFactory({
                id: currentUser.id,
                name: "Updated Name",
                email: currentUser.email,
            })
            useAuthState.getState().setUser(currentUser)
            const patch = vi.spyOn(server.user, "patch")
                .mockResolvedValue({ user: updatedUser })
            const onSuccess = vi.fn()
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useUpdateFormInputs({ onSuccess }),
                { wrapper },
            )

            expect(result.current.values).toEqual({
                name: "Current Name",
                email: "current@example.com",
            })
            act(() => {
                result.current.bindings.name.set("Updated Name")
            })
            act(() => {
                result.current.handleSubmit({
                    preventDefault: vi.fn(),
                } as never)
            })

            await waitFor(() => expect(patch).toHaveBeenCalledWith({
                userInput: {
                    name: "Updated Name",
                    email: "current@example.com",
                },
            }))
            expect(useAuthState.getState().user).toBe(updatedUser)
            expect(onSuccess).toHaveBeenCalledOnce()
            expect(result.current.values).toEqual({
                name: "Updated Name",
                email: "current@example.com",
            })
        },
    )
})

describe("useSetPasswordFormInputs intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality submits the password and calls onSuccess", async () => {
        const patchPassword = vi.spyOn(server.user, "patchPassword")
            .mockResolvedValue({
                accessToken: "password-token",
                user: userFactory(),
            })
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useSetPasswordFormInputs({ onSuccess }),
            { wrapper },
        )

        act(() => {
            result.current.bindings.password.set("new-password")
            result.current.bindings.rePassword.set("new-password")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(patchPassword)
            .toHaveBeenCalledWith({ password: "new-password" }))
        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("requires the confirmation field", () => {
        const patchPassword = vi.spyOn(server.user, "patchPassword")
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useSetPasswordFormInputs({}),
            { wrapper },
        )

        act(() => {
            result.current.bindings.password.set("new-password")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg)
            .toBe("Re-enter Password required")
        expect(patchPassword).not.toHaveBeenCalled()
    })
})

describe("useAdminSearchParams intimacy: medium", () => {
    it("functionality exposes defaults and parses URL parameters", () => {
        const { wrapper } = createWrapper(
            "/admin/users?search=amulet&registration=registered,guest"
            + "&sortBy=Spent&isAscending=true",
        )

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            search: "amulet",
            registration: ["registered", "guest"],
            sortBy: "Spent",
            isAscending: true,
        })
    })

    it("uses empty filters and the default sort by default", () => {
        const { wrapper } = createWrapper("/admin/users")

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            search: "",
            registration: [],
            sortBy: "createdAt",
            isAscending: false,
        })
    })
})
