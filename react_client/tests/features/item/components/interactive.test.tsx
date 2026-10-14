import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetCartState } from "../../../utils"
import { productFactory } from "../../../../mock_data/product"
import { server } from "@/core"
import {
    AddToCartButton,
    CartMenuButton,
} from "@/features/item/components/interactive"
import { useCartState } from "@/features/item/state"

describe("AddToCartButton intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders an add action for a product outside the cart",
        () => {
            const product = productFactory({ id: 1 })

            renderWithRouter(<AddToCartButton product={product} />)

            expect(screen.getByRole("button", { name: "Add to Cart" }))
                .toBeInTheDocument()
        },
    )

    it("adds the product to the cart when selected", async () => {
        const product = productFactory({ id: 2 })
        const user = userEvent.setup()

        renderWithRouter(<AddToCartButton product={product} />)
        await user.click(screen.getByRole("button", {
            name: "Add to Cart",
        }))

        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(1)
    })

    it("shows quantity controls for an existing cart item", async () => {
        const product = productFactory({ id: 3 })
        resetCartState([product])

        renderWithRouter(<AddToCartButton product={product} />)

        const quantity = screen.getByPlaceholderText("quantity")
        expect(quantity).toHaveValue(2)
        expect(screen.getByRole("button", { name: "MinusIcon" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "PlusIcon" }))
            .toBeInTheDocument()
    })

    it("changes quantity with plus and minus controls", async () => {
        const product = productFactory({ id: 4 })
        resetCartState([product])
        const user = userEvent.setup()

        renderWithRouter(<AddToCartButton product={product} />)
        await user.click(screen.getByRole("button", { name: "PlusIcon" }))
        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(3)

        await user.click(screen.getByRole("button", { name: "MinusIcon" }))
        expect(useCartState.getState().getCartItem(product)?.quantity)
            .toBe(2)
    })

    it("updates quantity from the edited input when it loses focus",
        async () => {
            const product = productFactory({ id: 5 })
            resetCartState([product])
            const user = userEvent.setup()

            renderWithRouter(<AddToCartButton product={product} />)
            const quantity = screen.getByPlaceholderText("quantity")
            await user.clear(quantity)
            await user.type(quantity, "4")
            await user.tab()

            expect(useCartState.getState().getCartItem(product)?.quantity)
                .toBe(4)
        },
    )
})

describe("CartMenuButton intimacy: high", () => {
    beforeEach(() => {
        resetCartState([])
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders the empty-cart icon", () => {
        renderWithRouter(
            <CartMenuButton onCheckoutClick={() => {}} />,
        )

        expect(screen.getByLabelText("ShoppingCartOutlineIcon"))
            .toBeInTheDocument()
    })

    it("opens the cart menu when the cart contains items", async () => {
        const product = productFactory({ id: 6 })
        resetCartState([product])
        const user = userEvent.setup()

        renderWithRouter(
            <CartMenuButton onCheckoutClick={() => {}} />,
        )
        await user.click(screen.getByRole("button"))

        expect(screen.getByRole("heading", { name: "Cart" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Checkout" }))
            .toBeInTheDocument()
    })

    it("passes checkout selection to the callback", async () => {
        const product = productFactory({ id: 7 })
        resetCartState([product])
        const onCheckoutClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <CartMenuButton onCheckoutClick={onCheckoutClick} />,
        )
        await user.click(screen.getByRole("button"))
        await user.click(screen.getByRole("button", { name: "Checkout" }))

        expect(onCheckoutClick).toHaveBeenCalledOnce()
    })
})
