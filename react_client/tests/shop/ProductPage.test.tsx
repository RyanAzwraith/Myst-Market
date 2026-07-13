import { describe, vi, beforeEach, test } from "vitest"
import { waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByText,
} from "../utils";

import { AppRoutes } from '@/AppRoutes'
import { ProductPage } from '@/features/shop/ProductPage'



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

describe("ProductPage", () => {
    const sampleProduct ={
        id: 1,
        name: "Sword of Dawn",
        categoryName: 'catOne',
        rarityName: 'rarityOne',
        priceAudCent: 10000,
        slug: "sword-of-dawn",
        description: "Ancient enchanted sword",
        stock: 5,
        saleSlug: null,
    }

    beforeEach(async () => {
        mockRequest.mockResolvedValue({product: sampleProduct})
        renderWithRouter(
            <ProductPage />, 
            {
                path: `${AppRoutes.product}/:slug`,
                initialPath: `${AppRoutes.product}/${sampleProduct.slug}`,
            }
        )
        user = userEvent.setup()
    })

    test("product info is shown", async () => {
        await waitFor(() => getByText(sampleProduct.name))
        getByText(`${sampleProduct.categoryName} - ${sampleProduct.rarityName}`)
        getByText(`Stock ${sampleProduct.stock}`)
        getByText(sampleProduct.description)

    })
}) 