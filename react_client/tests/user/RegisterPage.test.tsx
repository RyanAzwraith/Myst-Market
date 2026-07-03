import { describe, expect, vi, beforeEach, test } from "vitest"
import { screen } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { AppRoutes } from '@/AppRoutes'
import { ServerException } from "@/core"
import { RegisterPage } from '@/features/user/RegisterPage'

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

const mockRegisterRoute = vi.hoisted(() => vi.fn())
vi.mock("@/features/user/authApi", () => ({
    registerRoute: mockRegisterRoute,
}))

let user: UserEvent

describe("RegisterPage", () => {

    beforeEach(() => {
        resetAuthState()
        renderWithRouter(<RegisterPage />)
        user = userEvent.setup()
    })

    describe("Form", () => {
        const nameInput = () => screen.getByPlaceholderText("Name")
        const emailInput = () => screen.getByPlaceholderText("Email")
        const sendSetPasswordEmailButton = () => getByRole("button", "Send set password email")

        const sampleData = {
            name: "some one",
            email: "some@mail.com",
        }

        async function fillForm ({name, email} : {name?:string, email?:string} = {}) {
            await user.clear(nameInput())
            await user.clear(emailInput())
            await user.type(nameInput(), name ?? sampleData.name)
            await user.type(emailInput(), email ?? sampleData.email)
            await user.click(sendSetPasswordEmailButton())
        } 

        test("validation", async() => {
            await fillForm({name: " "})
            getByText("Name required")
            await fillForm({email:" "})
            getByText("Email required")
            await fillForm({email:"invalid email"})
            getByText("Invalid email")
            expect(mockRegisterRoute).not.toHaveBeenCalled()
        })

        test("submit", async () => {
            mockRegisterRoute.mockResolvedValue(null)
            await fillForm()
            expect(mockRegisterRoute).toHaveBeenCalledWith(sampleData)
            expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.login)
        })

        test("request error", async () => {
            const rejected = new ServerException({message: "Server Error"})
            mockRegisterRoute.mockRejectedValue(rejected)
            await fillForm()
            getByText(rejected.message)
        })
    })

    test("Login Button" , async () => {
        await user.click(getByRole("button", "Login"))
        expect(mockNavigate).toHaveBeenCalledWith(AppRoutes.login)
    })
})