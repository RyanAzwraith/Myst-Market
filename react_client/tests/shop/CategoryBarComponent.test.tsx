import { describe, expect, vi, beforeEach, test, } from "vitest"
import { waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"
import { 
    renderWithRouter, 
    getByRole,
} from "../utils";

import { AppRoutes } from '@/app/PageRoutes'
import { CategoryBarComponent } from '@/features/shop/CategoryBarComponent'



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

describe("CategoryBarComponent", () => {

    const [catOne, catTwo] = ['catOne', 'catTwo']

    beforeEach(async () => {
        mockRequest.mockResolvedValue({categories: [catOne, catTwo]})
        renderWithRouter(<CategoryBarComponent />)
        user = userEvent.setup()
    })

    test("Category Button navigate to shop", async () => {
        await waitFor(() => user.click(getByRole("button", catOne)))
        expect(mockNavigate).toHaveBeenCalledWith(`${AppRoutes.shop}?categories=${catOne}`)
        await user.click(getByRole("button", catTwo))
        expect(mockNavigate).toHaveBeenCalledWith(`${AppRoutes.shop}?categories=${'catTwo'}`)
    })
}) 





