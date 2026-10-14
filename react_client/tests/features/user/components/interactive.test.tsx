import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../../../utils"
import { mockAccessToken } from "../../../../mock_data/auth"
import { userFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    DeleteUserButton,
    LogoutButton,
    PasswordResetButton,
    RegisterForm,
    SetPasswordForm,
    UpdateForm,
} from "@/features/user/components/interactive"
import { useAuthState } from "@/features/auth/state"

describe("RegisterForm intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the registration fields and submit action", () => {
        renderWithRouter(<RegisterForm />)

        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Send set password email",
        })).toBeInTheDocument()
    })

    it("submits registration details and calls onSuccess", async () => {
        const create = vi.spyOn(server.user, "create")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const userActions = userEvent.setup()

        renderWithRouter(<RegisterForm onSuccess={onSuccess} />)
        await userActions.type(
            screen.getByPlaceholderText("Name"),
            "New Customer",
        )
        await userActions.type(
            screen.getByPlaceholderText("Email"),
            "new@example.com",
        )
        await userActions.click(screen.getByRole("button", {
            name: "Send set password email",
        }))

        await vi.waitFor(() => expect(create).toHaveBeenCalledWith({
            userInput: {
                name: "New Customer",
                email: "new@example.com",
            },
        }))
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("SetPasswordForm intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders both password fields", () => {
        renderWithRouter(<SetPasswordForm />)

        expect(screen.getByLabelText("Password")).toBeInTheDocument()
        expect(screen.getByLabelText("Re-enter Password"))
            .toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Send set password email",
        })).toBeInTheDocument()
    })

    it("submits the password, updates auth state, and calls onSuccess",
        async () => {
            const user = userFactory({ email: "updated@example.com" })
            const patchPassword = vi.spyOn(server.user, "patchPassword")
                .mockResolvedValue({
                    accessToken: mockAccessToken,
                    user,
                })
            const onSuccess = vi.fn()
            const userActions = userEvent.setup()

            renderWithRouter(<SetPasswordForm onSuccess={onSuccess} />)
            await userActions.type(
                screen.getByLabelText("Password"),
                "new-password",
            )
            await userActions.type(
                screen.getByLabelText("Re-enter Password"),
                "new-password",
            )
            await userActions.click(screen.getByRole("button", {
                name: "Send set password email",
            }))

            await vi.waitFor(() => expect(patchPassword)
                .toHaveBeenCalledWith({ password: "new-password" }))
            expect(useAuthState.getState().accessToken)
                .toBe(mockAccessToken)
            expect(useAuthState.getState().user).toBe(user)
            expect(onSuccess).toHaveBeenCalledOnce()
        },
    )
})

describe("UpdateForm intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the current user and reset action", () => {
        const user = userFactory({
            name: "Current Name",
            email: "current@example.com",
        })
        useAuthState.getState().setUser(user)

        renderWithRouter(<UpdateForm />)

        expect(screen.getByPlaceholderText("Name"))
            .toHaveValue("Current Name")
        expect(screen.getByPlaceholderText("Email"))
            .toHaveValue("current@example.com")
        expect(screen.getByRole("button", { name: "Save" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Reset" }))
            .toBeInTheDocument()
    })

    it("submits changed details and updates the current user", async () => {
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
        const userActions = userEvent.setup()

        renderWithRouter(<UpdateForm onSuccess={onSuccess} />)
        const name = screen.getByPlaceholderText("Name")
        await userActions.clear(name)
        await userActions.type(name, "Updated Name")
        await userActions.click(screen.getByRole("button", { name: "Save" }))

        await vi.waitFor(() => expect(patch).toHaveBeenCalledWith({
            userInput: {
                name: "Updated Name",
                email: "current@example.com",
            },
        }))
        expect(useAuthState.getState().user).toBe(updatedUser)
        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("restores the initial values when reset is selected", async () => {
        const user = userFactory({
            name: "Current Name",
            email: "current@example.com",
        })
        useAuthState.getState().setUser(user)
        const userActions = userEvent.setup()

        renderWithRouter(<UpdateForm />)
        const name = screen.getByPlaceholderText("Name")
        await userActions.clear(name)
        await userActions.type(name, "Unsaved Name")
        await userActions.click(screen.getByRole("button", {
            name: "Reset",
        }))

        expect(name).toHaveValue("Current Name")
    })
})

describe("LogoutButton intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the logout action", () => {
        renderWithRouter(<LogoutButton />)

        expect(screen.getByRole("button", { name: "Logout" }))
            .toBeInTheDocument()
    })

    it("logs out through the server and calls onSuccess", async () => {
        const user = userFactory()
        useAuthState.getState().login(mockAccessToken, user)
        const logout = vi.spyOn(server.auth, "logout")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const userActions = userEvent.setup()

        renderWithRouter(<LogoutButton onSuccess={onSuccess} />)
        await userActions.click(
            screen.getByRole("button", { name: "Logout" }),
        )

        await vi.waitFor(() => expect(logout).toHaveBeenCalledOnce())
        expect(useAuthState.getState().isLoggedIn()).toBe(false)
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("PasswordResetButton intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the password reset action", () => {
        renderWithRouter(<PasswordResetButton />)

        expect(screen.getByRole("button", {
            name: "Set password with email",
        })).toBeInTheDocument()
    })

    it("sends a password email and calls onSuccess", async () => {
        const passwordEmail = vi.spyOn(server.user, "passwordEmail")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const userActions = userEvent.setup()

        renderWithRouter(<PasswordResetButton onSuccess={onSuccess} />)
        await userActions.click(screen.getByRole("button", {
            name: "Set password with email",
        }))

        await vi.waitFor(() => expect(passwordEmail)
            .toHaveBeenCalledOnce())
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("DeleteUserButton intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality opens the delete confirmation", async () => {
        const userActions = userEvent.setup()

        renderWithRouter(<DeleteUserButton />)
        await userActions.click(screen.getByRole("button", {
            name: "Delete Profile",
        }))

        expect(screen.getByText(
            "Are you sure you'd like to delete your Profile?",
        )).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Yes" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "No" }))
            .toBeInTheDocument()
    })

    it("deletes the account and closes the confirmation on success",
        async () => {
            const remove = vi.spyOn(server.user, "delete")
                .mockResolvedValue(undefined)
            const onSuccess = vi.fn()
            const userActions = userEvent.setup()

            renderWithRouter(<DeleteUserButton onSuccess={onSuccess} />)
            await userActions.click(screen.getByRole("button", {
                name: "Delete Profile",
            }))
            await userActions.click(screen.getByRole("button", {
                name: "Yes",
            }))

            await vi.waitFor(() => expect(remove).toHaveBeenCalledOnce())
            expect(onSuccess).toHaveBeenCalledOnce()
            expect(screen.queryByText(
                "Are you sure you'd like to delete your Profile?",
            )).not.toBeInTheDocument()
        },
    )

    it("closes the confirmation without deleting on No", async () => {
        const remove = vi.spyOn(server.user, "delete")
        const userActions = userEvent.setup()

        renderWithRouter(<DeleteUserButton />)
        await userActions.click(screen.getByRole("button", {
            name: "Delete Profile",
        }))
        await userActions.click(screen.getByRole("button", { name: "No" }))

        expect(remove).not.toHaveBeenCalled()
        expect(screen.queryByText(
            "Are you sure you'd like to delete your Profile?",
        )).not.toBeInTheDocument()
    })
})
