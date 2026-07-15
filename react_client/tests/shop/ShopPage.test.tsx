import { describe, vi, beforeEach, test, expect } from "vitest"
import { waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByText,
    getByLabelText,
    expectIsNullByLabelText,
} from "../utils";

import { ShopPage } from '@/features/shop/ShopPage'


const mockRequest = vi.hoisted(() => vi.fn())
vi.mock('@/api', async () => ({
    request: mockRequest 
}))

let user: UserEvent

describe("ShopPage", () => {

    const sampleProducts = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `product-${i + 1}`,
        categoryName: 'catOne',
        rarityName: 'catTwo',
        priceAudCent: 10000,
        slug: "sword-of-dawn",
        description: "Ancient enchanted sword",
        stock: 1,
    }))

    beforeEach(async () => {
        mockRequest
        .mockResolvedValueOnce({categories: ['catOne']})
        .mockResolvedValueOnce({rarities: ['rarTwo']})
        .mockResolvedValueOnce({
            products: sampleProducts.slice(0, 20),
            hasMore: true,
        })
        .mockResolvedValueOnce({
            products: sampleProducts.slice(20),
            hasMore: false,
        })
        renderWithRouter( <ShopPage />)
        user = userEvent.setup()
    })

    test("pageination works", async () => {
        await waitFor(() => getByText(sampleProducts[0].name))
        await user.click(getByLabelText('ChevronDownIcon'))
        await waitFor(() => getByText(sampleProducts[25].name))
        expectIsNullByLabelText('ChevronDownIcon')
    })
}) 