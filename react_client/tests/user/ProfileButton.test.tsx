import { describe, expect, vi, beforeEach, test } from "vitest"
import { screen } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { AppRoutes } from '@/app/PageRoutes'
import { ServerException } from "@/core"
import { useAuthState, type AuthState } from '@/features/user/authState'
import { ProfileButtonComponent } from '@/features/user/ProfileButtonComponent'

import { 
    renderWithRouter, 
    resetAuthState, 
    getByRole,
    getByText,
    expectIsNullByText,
} from "../utils";

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => ({
    ...await vi.importActual("react-router-dom"), 
    useNavigate: () => mockNavigate 
}))

const mockLoginRoute = vi.hoisted(() => vi.fn())
vi.mock("@/features/user/authApi", () => ({
    loginRoute: mockLoginRoute,
}))

let user: UserEvent

const sampleAuthState:Partial<AuthState> = {
    accessToken: "ItsAnAccessToken",
    userModel: {
        id : 4,
        email : "some@mail.com",
        name : "someone",
    }
}    

describe("ProfileButtonComponent", () => {
    beforeEach(() => {
        resetAuthState(sampleAuthState)
        renderWithRouter(<ProfileButtonComponent />)
        user = userEvent.setup()
    })

    test("IconButton naviagtes when logged in", async () => {
        expect(useAuthState.getState().accessToken).toBeDefined()
        await user.click(screen.getByLabelText("solidIcon"))
        expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.profile)
    })
 
})

describe("LoginModalContent", () => {

    beforeEach(async () => {
        resetAuthState()
        renderWithRouter(<ProfileButtonComponent />)
        user = userEvent.setup()
        await user.click(screen.getByLabelText("outLineIcon"))
        getByText("Sign in")
    })

    const sampleData = {
        email: "email@mail.com",
        password: "password"
    }
    const emailInput = ():HTMLInputElement => screen.getByPlaceholderText("Email")
    const passwordInput = ():HTMLInputElement => screen.getByPlaceholderText("Password")
    const loginButton = () => getByRole("button", "Login")

    async function fillForm ({email, password} : {email?:string, password?:string|null} = {}) {
        await user.clear(emailInput())
        await user.clear(passwordInput())
        await user.type(emailInput(), email ?? sampleData.email)
        if (password !== null)
            await user.type(passwordInput(), password ?? sampleData.password)
        await user.click(loginButton())
    } 

    test("validation", async () => {
        await fillForm({email:" "})
        expect(getByText("Email required"))
        await  fillForm({email:"invalid email"})
        expect(getByText("Invalid email"))
        await  fillForm({password:null})
        expect(getByText("Password required"))
        expect(mockLoginRoute).not.toHaveBeenCalled()
    })

    test ("submit", async () => {
        const resolved = {
            accessToken: "ItsAnAccessToken",
            userResponse: {
                id : 4,
                email : "some@mail.com",
                name : "someone",
            }
        }
        mockLoginRoute.mockResolvedValue(resolved)
        await  fillForm()
        expect(mockLoginRoute).toHaveBeenCalledWith(sampleData)
        expect(useAuthState.getState().accessToken).toBe(resolved.accessToken)
        expect(useAuthState.getState().userModel).toBe(resolved.userResponse)
        expect(mockNavigate).not.toHaveBeenCalled()
        expectIsNullByText("Sign in")
    })

    test("request error", async () => {
        const rejected = new ServerException({message: "Authentication Error"})
        mockLoginRoute.mockRejectedValue(rejected)
        await fillForm()
        expect(getByText(rejected.message))
    })
    
    test("Register button navigates to register", async () => {
        await user.click(getByRole("button", "Register"))
        expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.register)
    })
})