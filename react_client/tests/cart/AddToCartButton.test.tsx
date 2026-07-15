import { describe, beforeEach, test, expect } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    getByRole,
    getByLabelText,
    getByPlaceholder,
} from "../utils";

import { AddToCartButton } from '@/features/cart/addToCartButton'
import { useCartState } from "@/features/cart/cartService";
import type { ProductDetail } from "@/features/shop/shopSchemas";

let user: UserEvent

function CartQuantityDisplay({ product }: { product: ProductDetail }) {
    const item = useCartState(state => state.getCartItem(product))
    return  <p data-testid="quantity">{item?.quantity ?? 0} </p>
}

describe("AddToCartButton", () => {

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
        renderWithRouter( 
            <div>
                <AddToCartButton product={sampleProduct} />
                <CartQuantityDisplay product={sampleProduct}/>
            </div>
        )
        user = userEvent.setup()
    })

    test("components updates quantity", async () => {
        await user.click(getByRole('button', 'Add to Cart'))
        expect(screen.getByTestId("quantity")).toHaveTextContent("1")

        await user.click(getByLabelText("plusicon"))
        expect(screen.getByTestId("quantity")).toHaveTextContent("2")

        await user.click(getByLabelText('minusicon'))
        expect(screen.getByTestId("quantity")).toHaveTextContent("1")

        await user.type(getByPlaceholder("quantity"), '26')
        await user.tab()
        expect(screen.getByTestId("quantity")).toHaveTextContent("26")
        await user.type(getByPlaceholder("quantity"), '0')
        await user.tab()
        expect(screen.getByTestId("quantity")).toHaveTextContent("0")
        waitFor(() => getByRole('button', 'Add to Cart'))
    })
}) 