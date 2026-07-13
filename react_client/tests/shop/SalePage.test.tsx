import { describe, vi, beforeEach, test } from "vitest"
import { waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByText,
} from "../utils";

import { AppRoutes } from '@/AppRoutes'
import { SalePage } from '@/features/shop/SalePage'

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

const now = Date.now()

describe("SalePage", () => {
    const sampleSale = {
        id: 1,
        name: 'summer sale',
        slug: 'summer-sale',
        description: 'description',
        discountPercent: 20,
        startAt: now,
        endAt: now + 1
    }
    

    beforeEach(async () => {
        mockRequest.mockResolvedValue({sales: [sampleSale]})
        renderWithRouter(
            <SalePage />, 
            {
                path: `${AppRoutes.sale}/:slug`,
                initialPath: `${AppRoutes.sale}/${sampleSale.slug}`,
            }
        )
        user = userEvent.setup()
    })

    test("sale info is shown", async () => {
        await waitFor(() => getByText(sampleSale.name))
        getByText(`${sampleSale.discountPercent}% off!`)
        getByText(sampleSale.description)

    })
}) 