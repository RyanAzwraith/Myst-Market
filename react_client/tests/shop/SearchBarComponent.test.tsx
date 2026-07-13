import { describe, expect, vi, beforeEach, test } from "vitest"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByPlaceholder,
    getByLabelText,
} from "../utils";

import { AppRoutes } from '@/AppRoutes'
import { SearchBarComponent } from '@/features/shop/SearchBarComponent'



const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => ({
    ...await vi.importActual("react-router-dom"), 
    useNavigate: () => mockNavigate 
}))

const mockRequest = vi.hoisted(() => vi.fn())
vi.mock('@/api', async () => ({
    request: mockRequest 
}))

let user: UserEvent


describe("SearchBarComponent", () => {
    const sampleText = "xyz"
    
    beforeEach(async () => {
        renderWithRouter(<SearchBarComponent />)
        user = userEvent.setup()
    })

    test("can change value", async () => {
        const searchInput = getByPlaceholder('search')
        await user.type(searchInput, sampleText)
        expect(searchInput).toHaveValue(sampleText)
    })

    test("on Enter navigates and clears", async () => {
        const searchInput = getByPlaceholder('search')
        await user.type(searchInput, sampleText)
        await user.click(searchInput);
        await user.keyboard("{Enter}");
        expect(mockNavigate).toHaveBeenCalledWith(
            `${AppRoutes.shop}?search=${sampleText}`
        )
    })
    test("x icon clears", async () => {
        const searchInput = getByPlaceholder('search')
        await user.type(searchInput, sampleText)
        await user.click(getByLabelText('xmarkicon'))
        expect(mockNavigate).toHaveBeenCalledWith(
            `${AppRoutes.shop}`
        )
        expect(searchInput).toHaveValue("")

    })
}) 