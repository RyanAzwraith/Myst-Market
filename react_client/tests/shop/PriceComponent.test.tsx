import { describe, vi, beforeEach, test } from "vitest"
import { waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByText,
} from "../utils";
import { formatMoney } from "@/utils/formatMoney"

import { PriceComponent } from '@/features/shop/PriceComponent'



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

describe("PriceComponent", () => {
    const sampleSale = {
        id: 1,
        name: 'summer sale',
        slug: 'summer-sale',
        description: 'summer sale',
        discountPercent: 20,
        startAt: now,
        endAt: now
    }
    
    const sampleProduct ={
        id: 1,
        name: "Sword of Dawn",
        categoryName: 'catOne',
        rarityName: 'catTwo',
        priceAudCent: 10000,
        slug: "sword-of-dawn",
        description: "Ancient enchanted sword",
        stock: 1,
        saleSlug: sampleSale.slug,
    }


    beforeEach(async () => {
        mockRequest.mockResolvedValue({sales: [sampleSale]})
        renderWithRouter(<PriceComponent product={sampleProduct}/>)
        user = userEvent.setup()
    })

    test("sale shows with discounted price", async () => {
        await waitFor(() => getByText(sampleSale.name))
        getByText(formatMoney(
            sampleProduct.priceAudCent * (100 - sampleSale.discountPercent)
        ))
    })
}) 
