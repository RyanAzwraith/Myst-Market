import { describe, expect, vi, beforeEach, test } from "vitest"
import { screen } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { AppRoutes } from '@/AppRoutes'
import { ServerException } from "@/core"
import { useAuthState, type AuthState } from '@/features/user/authState'
import { ProfilePage } from '@/features/user/ProfilePage'

import { 
    renderWithRouter, 
    resetAuthState, 
    getByRole,
    getByText,
    expectIsNullByRole, 
} from "../utils";

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => ({
    ...await vi.importActual("react-router-dom"), 
    useNavigate: () => mockNavigate 
}))

const mocklogoutRoute = vi.hoisted(() => vi.fn())
const mockDeleteUserRoute = vi.hoisted(() => vi.fn())
const mockPostSetPasswordEmailRoute = vi.hoisted(() => vi.fn())
const mockPatchUserRoute = vi.hoisted(() => vi.fn())
vi.mock("@/features/user/authApi", () => ({
    logoutRoute: mocklogoutRoute,
    deleteUserRoute: mockDeleteUserRoute,
    postSetPasswordEmailRoute: mockPostSetPasswordEmailRoute,
    patchUserRoute: mockPatchUserRoute,
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

beforeEach(() => {
    resetAuthState(sampleAuthState)
    renderWithRouter(<ProfilePage />)
    user = userEvent.setup()
})

describe("ProfilePage", () => {
    test("Logout Button", async () => {
        mocklogoutRoute.mockResolvedValue(null)
        await user.click(getByRole("button", "Logout"))
        expect(mocklogoutRoute).toHaveBeenCalled()
        expect(useAuthState.getState().accessToken).toBeNull()
    })

    test("set password with email Button", async () => {
        mockPostSetPasswordEmailRoute.mockResolvedValue(null)
        await user.click(getByRole("button", "Set password with email"))
        expect(mockPostSetPasswordEmailRoute).toHaveBeenCalled()
    })
})

describe("UpdateProfileComponent", () => {

    const sampleData = {
        name : "new someone",
        email : "newsome@mail.com",
    }

    const nameInput = ():HTMLInputElement => screen.getByPlaceholderText("Name")
    const emailInput = ():HTMLInputElement => screen.getByPlaceholderText("Email")
    const updateButton = () => getByRole("button", "Update")
    const saveButton = () => getByRole("button", "Save")
    const cancelButton = () => getByRole("button", "Cancel")

    describe("isEditing Toggle", () => {
        test("update button prevents editing", async () => {
            expect(nameInput().readOnly).toBe(true)
            expect(emailInput().readOnly).toBe(true)
            await user.click(updateButton())
            saveButton()
            cancelButton()
            expect(nameInput().readOnly).toBe(false)
            expect(emailInput().readOnly).toBe(false)
        })

        test("cancel button resets", async () => {
            await user.click(updateButton())
            await user.type(nameInput(), sampleData.name)
            await user.type(emailInput(), sampleData.email)
            await user.click(cancelButton())

            expectIsNullByRole("button", "Save")
            expectIsNullByRole("button", "Cancel")

            expect(nameInput().value).toBe(sampleAuthState.userModel!.name)
            expect(emailInput().value).toBe(sampleAuthState.userModel!.email)
            expect(nameInput().readOnly).toBe(true)
            expect(emailInput().readOnly).toBe(true)
        })
    })

    describe("Update Form", () => {

        async function fillUpdateForm ({email, name} : {email?:string, name?:string} = {}) {
            if (nameInput().readOnly===true) 
                await user.click(updateButton())
            await user.clear(nameInput())
            await user.clear(emailInput())
            await user.type(nameInput(), name ?? sampleData.name)
            await user.type(emailInput(), email ?? sampleData.email)
            await user.click(saveButton())
        } 

        test("validation", async () => {
            await fillUpdateForm({email:" "})
            getByText("Email required")
            await  fillUpdateForm({email:"invalid email"})
            getByText("Invalid email")
            await  fillUpdateForm({name: " "})
            getByText("Name required")
            expect(mockPatchUserRoute).not.toHaveBeenCalled()
        })

        test ("submit", async () => {
            const resolved = {
                id : 4,
                name: sampleData.name,
                email : sampleData.email,
            }
            mockPatchUserRoute.mockResolvedValue(resolved)
            await fillUpdateForm()
            expect(mockPatchUserRoute).toHaveBeenCalledWith(sampleData)
            expect(useAuthState.getState().accessToken).toBe(sampleAuthState.accessToken)
            expect(useAuthState.getState().userModel).toStrictEqual(resolved)
        })

        test("request error", async () => {
            const rejected = new ServerException({ message: "Server Error"})
            mockPatchUserRoute.mockRejectedValue(rejected)
            await fillUpdateForm()
            getByText(rejected.message)
        })
    })
})

describe("ConfirmDeletePopupContent", () => {
    test("Submit", async () => {
        mockDeleteUserRoute.mockResolvedValue(null)
        await user.click(getByRole("button", "Delete Profile"))
        await user.click(getByRole("button", "Yes"))
        expect(mockDeleteUserRoute).toHaveBeenCalled()
        expect(useAuthState.getState().accessToken).toBeNull()
        expect(useAuthState.getState().userModel).toBeNull()
    })
})