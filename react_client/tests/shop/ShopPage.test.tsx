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
    authRequest: mockRequest 
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
        media: {
            3: {
                id: 999,
                mediaType: "video",
                mediaUrl: "https://example.com/video.mp4",
                entityId: 3,
                entityType: "product",
                altText: "media-for-3",
                sortOrder: null,
            }
        }
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

        // assert media retrieval was requested for loaded product ids
        const mediaCall = mockRequest.mock.calls.find(c => c[0] === "/products/media")
        if (!mediaCall) throw new Error("Expected /products/media to be requested")
        const body = JSON.parse(mediaCall[1].body)
        expect(body.productIds).toEqual(sampleProducts.slice(0,20).map(p=>p.id))

        // the returned media detail should render on matching product card
        await waitFor(() => getByLabelText('media-for-3'))
        await user.click(getByLabelText('ChevronDownIcon'))
        await waitFor(() => getByText(sampleProducts[25].name))
        expectIsNullByLabelText('ChevronDownIcon')
    })
}) 
