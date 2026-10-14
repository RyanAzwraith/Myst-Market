import { beforeEach, describe, expect, it } from "vitest"

import { resetCartState } from "../../utils"
import { productFactory } from "../../../mock_data/product"
import { useCartState } from "@/features/item/state"

describe("useCartState intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality adds an item and calculates its total", () => {
        const product = productFactory({
            id: 1,
            priceAudCent: 1500,
            discountedPrice: null,
            sale: null,
        })

        useCartState.getState().addItem(product, 2)

        expect(useCartState.getState().items).toHaveLength(1)
        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(2)
        expect(useCartState.getState().getTotal()).toBe(3000)
        expect(useCartState.getState().isEmpty()).toBe(false)
    })

    it("uses the discounted price and marks sale items", () => {
        const product = productFactory({
            id: 2,
            priceAudCent: 1500,
            discountedPrice: 900,
            sale: {
                name: "Spring Sale",
                slug: "spring-sale",
                discountPerc: 40,
            },
        })

        useCartState.getState().addItem(product, 2)

        expect(useCartState.getState().items[0]).toMatchObject({
            priceCent: 900,
            onSale: true,
        })
        expect(useCartState.getState().getTotal()).toBe(1800)
    })

    it("does not add the same product more than once", () => {
        const product = productFactory({ id: 3 })

        useCartState.getState().addItem(product, 2)
        useCartState.getState().addItem(product, 5)

        expect(useCartState.getState().items).toHaveLength(1)
        expect(useCartState.getState().items[0].quantity).toBe(2)
    })

    it("updates quantities and removes items at zero", () => {
        const product = productFactory({ id: 4 })
        useCartState.getState().addItem(product, 2)

        useCartState.getState().updateQuantity(product, 5)
        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(5)

        useCartState.getState().addQuantity(product, -2)
        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(3)

        useCartState.getState().updateQuantity(product, 0)
        expect(useCartState.getState().getCartItem(product)).toBeNull()
        expect(useCartState.getState().isEmpty()).toBe(true)
    })

    it("adds an item when updating a product not yet in the cart", () => {
        const product = productFactory({ id: 5 })

        useCartState.getState().updateQuantity(product, 3)

        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(3)
    })

    it("removes individual items and clears the cart", () => {
        const first = productFactory({ id: 6 })
        const second = productFactory({ id: 7 })
        useCartState.getState().addItem(first, 1)
        useCartState.getState().addItem(second, 1)

        useCartState.getState().removeItem(first)
        expect(useCartState.getState().getCartItem(first)).toBeNull()
        expect(useCartState.getState().getCartItem(second)).not.toBeNull()

        useCartState.getState().clearCart()
        expect(useCartState.getState().items).toEqual([])
        expect(useCartState.getState().isEmpty()).toBe(true)
    })
})
