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

describe("PriceComponent", () => {
    const sampleProduct ={
        id: 1,
        name: "Sword of Dawn",
        categoryName: 'catOne',
        rarityName: 'catTwo',
        priceAudCent: 10000,
        slug: "sword-of-dawn",
        description: "Ancient enchanted sword",
        stock: 1,
        discountedPrice: 8000,
        sale: {
            name: 'summer sale',
            slug: 'summer-sale',
            discountPercent: 20,
        }
    }


    beforeEach(async () => {
        renderWithRouter(<PriceComponent product={sampleProduct}/>)
        user = userEvent.setup()
    })

    test("sale shows with discounted price", async () => {
        await waitFor(() => getByText(sampleProduct.sale.name))
        getByText(formatMoney(
            (100 - sampleProduct.sale.discountPercent)/100 * sampleProduct.priceAudCent 
        ))
    })
}) 
