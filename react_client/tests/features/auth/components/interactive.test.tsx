import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetAuthState } from "../../../utils"
import { mockAccessToken } from "../../../../mock_data/auth"
import { userFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    LoginForm,
    ProfileMenuButton,
} from "@/features/auth/components/interactive"
import { useAuthState } from "@/features/auth/state"

describe("LoginForm intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders the login fields and submit action", () => {
        renderWithRouter(<LoginForm onSuccess={vi.fn()} />)

        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Login" }))
            .toBeInTheDocument()
    })

    it("submits credentials, updates auth state, and calls onSuccess",
        async () => {
            const user = userFactory()
            const onSuccess = vi.fn()
            const login = vi.spyOn(server.auth, "login")
                .mockResolvedValue({
                    accessToken: mockAccessToken,
                    user,
                })
            const userActions = userEvent.setup()

            renderWithRouter(<LoginForm onSuccess={onSuccess} />)
            await userActions.type(
                screen.getByPlaceholderText("Email"),
                user.email,
            )
            await userActions.type(
                screen.getByPlaceholderText("Password"),
                "password",
            )
            await userActions.click(
                screen.getByRole("button", { name: "Login" }),
            )

            await vi.waitFor(() => expect(login).toHaveBeenCalledWith({
                login: {
                    email: user.email,
                    password: "password",
                },
            }))
            expect(useAuthState.getState().user).toBe(user)
            expect(onSuccess).toHaveBeenCalledOnce()
        },
    )

    it("shows a server error without calling onSuccess", async () => {
        const onSuccess = vi.fn()
        vi.spyOn(server.auth, "login")
            .mockRejectedValue(new Error("Invalid credentials"))
        const userActions = userEvent.setup()

        renderWithRouter(<LoginForm onSuccess={onSuccess} />)
        await userActions.type(
            screen.getByPlaceholderText("Email"),
            "customer@example.com",
        )
        await userActions.type(
            screen.getByPlaceholderText("Password"),
            "wrong",
        )
        await userActions.click(
            screen.getByRole("button", { name: "Login" }),
        )

        expect(await screen.findByText("Invalid credentials"))
            .toBeInTheDocument()
        expect(onSuccess).not.toHaveBeenCalled()
    })
})

describe("ProfileMenuButton intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality invokes the solid icon callback when logged in",
        async () => {
            const user = userFactory()
            const onSolidClick = vi.fn()
            useAuthState.getState().login(mockAccessToken, user)
            const userActions = userEvent.setup()

            renderWithRouter(
                <ProfileMenuButton
                    onSolidClick={onSolidClick}
                    onOutlineClick={vi.fn()}
                />,
            )

            await userActions.click(
                screen.getByRole("button", {
                    name: "UserCircleSolidIcon",
                }),
            )

            expect(onSolidClick).toHaveBeenCalledOnce()
        },
    )

    it("opens the sign-in dialog when logged out", async () => {
        const userActions = userEvent.setup()

        renderWithRouter(
            <ProfileMenuButton
                onSolidClick={vi.fn()}
                onOutlineClick={vi.fn()}
            />,
        )

        await userActions.click(
            screen.getByRole("button"),
        )

        expect(screen.getByRole("dialog", { name: "Sign in" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Sign in" }))
            .toBeInTheDocument()
    })

    it("closes the dialog and invokes onOutlineClick on registration",
        async () => {
            const onOutlineClick = vi.fn()
            const userActions = userEvent.setup()

            renderWithRouter(
                <ProfileMenuButton
                    onSolidClick={vi.fn()}
                    onOutlineClick={onOutlineClick}
                />,
            )
            await userActions.click(
                screen.getByRole("button"),
            )
            await userActions.click(
                screen.getByRole("button", { name: "Register" }),
            )

            expect(onOutlineClick).toHaveBeenCalledOnce()
            expect(screen.queryByRole("dialog", { name: "Sign in" }))
                .not.toBeInTheDocument()
        },
    )

    it("closes the dialog when cancel is selected", async () => {
        const userActions = userEvent.setup()

        renderWithRouter(
            <ProfileMenuButton
                onSolidClick={vi.fn()}
                onOutlineClick={vi.fn()}
            />,
        )
        await userActions.click(
            screen.getByRole("button"),
        )
        await userActions.click(
            screen.getByRole("button", { name: "Cancel" }),
        )

        expect(screen.queryByRole("dialog", { name: "Sign in" }))
            .not.toBeInTheDocument()
    })
})
