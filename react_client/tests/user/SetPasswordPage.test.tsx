import { describe, expect, vi, beforeEach, test } from "vitest"
import { screen } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { AppRoutes } from '@/app/PageRoutes'
import { ServerException } from "@/core"
import { useAuthState } from '@/features/user/authState'
import { SetPasswordPage } from '@/features/user/SetPasswordPage'

import { 
    renderWithRouter, 
    resetAuthState, 
    getByRole,
    getByText,
} from "../utils";

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => ({
    ...await vi.importActual("react-router-dom"), 
    useNavigate: () => mockNavigate 
}))

const mockPatchUserPasswordRoute = vi.hoisted(() => vi.fn())
vi.mock("@/features/user/authApi", () => ({
    patchUserPasswordRoute: mockPatchUserPasswordRoute,
}))

let user: UserEvent

describe("SetPasswordPage", () => {

    beforeEach(() => {
        resetAuthState()
        renderWithRouter(<SetPasswordPage />)
        user = userEvent.setup()
    })

    const passwordInput = () => screen.getByPlaceholderText("Password")
    const secondaryPasswordInput = () => screen.getByPlaceholderText("Re-enter")
    const submitButton = () => getByRole("button", "Submit")

    const samplePassword = "password"

    async function fillForm ({password, secondaryPassword} : {password?:string|null, secondaryPassword?:string|null} = {}) {
        await user.clear(passwordInput())
        await user.clear(secondaryPasswordInput())
        if (password !== null) 
            await user.type(passwordInput(), password ?? samplePassword)
        if (secondaryPassword !== null) 
            await user.type(secondaryPasswordInput(), secondaryPassword ?? samplePassword)
        await user.click(submitButton())
    } 

    test("validation", async() => {
        await fillForm({password: null})
        getByText("Password required")
        await fillForm({secondaryPassword: null})
        getByText("Password must match")
        await fillForm({secondaryPassword: "incorrect Password"})
        getByText("Password must match")
        expect(mockPatchUserPasswordRoute).not.toHaveBeenCalled()
    })

    test("submit", async () => {
        const resolved = {
            accessToken: "ItsAnAccessToken",
            userResponse: {
                id : 4,
                email : "some@mail.com",
                name : "someone",
            }
        }
        mockPatchUserPasswordRoute.mockResolvedValue(resolved)
        await fillForm()
        expect(mockPatchUserPasswordRoute).toHaveBeenCalledWith({password: samplePassword})
        expect(useAuthState.getState().accessToken).toBe(resolved.accessToken)
        expect(useAuthState.getState().userModel).toBe(resolved.userResponse)
        expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.profile)
    })

    test("request error", async () => {
        const rejected = new ServerException({message: "Server Error"})
        mockPatchUserPasswordRoute.mockRejectedValue(rejected)
        await fillForm()
        getByText(rejected.message)
    })
})