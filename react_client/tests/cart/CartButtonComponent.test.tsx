import { describe, beforeEach, test, expect } from "vitest"
import { findByTestId, screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import {AppRoutes} from '@/app/PageRoutes'
import { 
    renderWithRouter, 
    getByRole,
    getByText,
    getByLabelText,
    expectIsNullByLabelText,
    resetCartState,
    expectIsNullByText,
} from "../utils";

import { useCartState } from "@/features/cart/cartService";
import { 
    CartButtonComponent,
    CartModalContent,
} from "@/features/cart/cartButtonComponent";

let user: UserEvent

function CartLengthDisplay() {
    const items = useCartState(state => state.items)
    return  <p data-testid="length">{items.length} </p>
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
    discountedPrice: 8000,
    sale: {
        name: 'summer sale',
        slug: 'summer-sale',
        discountPercent: 20,
    }
}
const sampleProductTwo ={
    id: 2,
    name: "Not sword of dawn",
    categoryName: 'catOne',
    rarityName: 'catTwo',
    priceAudCent: 5000,
    slug: "not-sword-of-dawn",
    description: "Ancient enchanted sword",
    stock: 1,
    discountedPrice: 5000,
    sale: {
        name: 'summer sale',
        slug: 'summer-sale',
        discountPercent: 20,
    }
}

describe("CartButtonComponent", () => {

    beforeEach(async () => {
        resetCartState([])

        renderWithRouter( 
            <div>
                <CartButtonComponent />
                <CartLengthDisplay />
            </div>
        )
        user = userEvent.setup()
    })

    test("modal only shows if cart isnt empty", async () => {
        getByLabelText('outlinecarticon')
        expectIsNullByLabelText("solidcarticon")
    })
}) 

describe("CartModalContent", () => {

    beforeEach(async () => {
        resetCartState([sampleProduct, sampleProductTwo])

        renderWithRouter( 
            <div>
                <CartModalContent onClose={() => null}/>
                <CartLengthDisplay />
            </div>
        )
        user = userEvent.setup()
    })

    test("modal lists items ", async () => {
        getByText(sampleProduct.name)
    })

    test("clear button empties cart", async () => {
        await user.click(getByRole('button', 'Clear'))
        expect(screen.getByTestId("length")).toHaveTextContent("0")
    })

    test("total is accurate", async () => {
        getByText('$ 260')
    })

    test("checkout button navigates", async () => {
        await user.click(getByRole('button', 'Checkout'))
        expect(screen.getByTestId("location"))
            .toHaveTextContent(AppRoutes.checkout)
    })

}) 

describe("CardItemCard", () => {

    beforeEach(async () => {
        resetCartState([sampleProduct])
        renderWithRouter( 
            <div>
                <CartLengthDisplay />
                <CartModalContent onClose={() => null}/>
            </div>
        )
        user = userEvent.setup()
    })

    test("cart Item total is accurate", async () => {
        waitFor(() => getByText('$ 160'))
    })

    test("x removes item", async () => {
        await user.click(getByLabelText('xmarkicon'))
        expectIsNullByText(sampleProduct.name)
    })

    test("navigates to product page on click", async () => {
        await user.click(getByText(sampleProduct.name))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.product}/${sampleProduct.slug}` 
        )
    })
}) 