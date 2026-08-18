import { describe, vi, beforeEach, test, } from "vitest"
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
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => ({
    ...await vi.importActual("react-router-dom"), 
    useNavigate: () => mockNavigate 
}))

const sampleCategories = ['catOne', 'catTwo']
const sampleRarities = ['rarOne', 'rarTwo']

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
    .mockResolvedValueOnce({categories: sampleCategories})
    .mockResolvedValueOnce({rarities: sampleRarities})
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

let user: UserEvent

describe("ShopPage", () => {

    test("pageination works", async () => {
        await waitFor(() => getByText(sampleProducts[0].name))
        await user.click(getByLabelText('ChevronDownIcon'))
        await waitFor(() => getByText(sampleProducts[25].name))
        expectIsNullByLabelText('ChevronDownIcon')
    })
}) 
