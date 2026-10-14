import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetCartState } from "../../../utils"
import { itemResolutionFactory, itemFactory } from "../../../../mock_data/item"
import { productFactory } from "../../../../mock_data/product"
import { server } from "@/core"
import {
    ItemCard,
    ResolutionCard,
} from "@/features/item/components/composition"
import { CartMenu } from "@/features/item/components/interactive"
import { useCartState } from "@/features/item/state"


describe("ItemCard intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders the cart item and remove action", () => {
        const item = itemFactory({
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }, productFactory({
            id: 1,
            name: "Cart Product",
            priceAudCent: 1500,
        }))

        renderWithRouter(<ItemCard item={item} />)

        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Cart Product" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "XMarkIcon" }))
            .toBeInTheDocument()
    })

    it("calls onClick with the item when the item content is selected",
        async () => {
            const item = itemFactory({
                quantity: 2,
                priceCent: 1500,
                onSale: false,
            }, productFactory({
                id: 1,
                name: "Cart Product",
                priceAudCent: 1500,
            }))

            const onClick = vi.fn()
            const user = userEvent.setup()

            renderWithRouter(<ItemCard item={item} onClick={onClick} />)
            await user.click(screen.getByRole("button", {
                name: /Cart Product/,
            }))

            expect(onClick).toHaveBeenCalledWith(item)
        },
    )

    it("removes the item when the close action is selected", async () => {
        const item = itemFactory({
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }, productFactory({
            id: 1,
            name: "Cart Product",
            priceAudCent: 1500,
        }))
        resetCartState([item.product])
        const user = userEvent.setup()

        renderWithRouter(<ItemCard item={item} />)
        await user.click(screen.getByRole("button", {
            name: "XMarkIcon",
        }))

        expect(useCartState.getState().getCartItem(item.product))
            .toBeNull()
    })
})

describe("ResolutionCard intimacy: medium", () => {
    beforeEach(() => {
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders a resolved item", () => {
        const item = itemResolutionFactory({
            product: {
                id: 2,
                saleID: null,
                name: "Resolved Product",
                slug: "resolved-product",
            },
            quantity: 1,
            unitPriceCent: 2000,
            lineTotalCent: 2000,
            onSale: false,
        })

        renderWithRouter(<ResolutionCard item={item} />)

        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Resolved Product",
        })).toBeInTheDocument()
    })

    it("calls onClick with the resolved item when selected", async () => {
        const item = itemResolutionFactory()
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <ResolutionCard item={item} onClick={onClick} />,
        )
        await user.click(screen.getByRole("article"))

        expect(onClick).toHaveBeenCalledWith(item)
    })
})

describe("CartMenu intimacy: high", () => {
    beforeEach(() => {
        resetCartState([])
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders cart contents and total", () => {
        const item = itemFactory({
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }, productFactory({
            id: 1,
            name: "Cart Product",
            priceAudCent: 1500,
        })) 
        resetCartState([item.product])

        renderWithRouter(
            <CartMenu
                onClose={vi.fn()}
                onCheckoutClick={vi.fn()}
            />,
        )

        expect(screen.getByRole("heading", { name: "Cart" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Cart Product" }))
            .toBeInTheDocument()
        expect(screen.getByText("Total").parentElement)
            .toHaveTextContent("$ 3000.00")
    })

    it("clears items and closes the menu", async () => {
        const item = itemFactory({
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }, productFactory({
            id: 1,
            name: "Cart Product",
            priceAudCent: 1500,
        }))
        resetCartState([item.product])
        const onClose = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <CartMenu
                onClose={onClose}
                onCheckoutClick={vi.fn()}
            />,
        )
        await user.click(screen.getByRole("button", { name: "Clear" }))

        expect(useCartState.getState().items).toEqual([])
        expect(onClose).toHaveBeenCalledOnce()
    })

    it("closes the menu and starts checkout", async () => {
        const item = itemFactory({
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }, productFactory({
            id: 1,
            name: "Cart Product",
            priceAudCent: 1500,
        }))
        resetCartState([item.product])
        const onClose = vi.fn()
        const onCheckoutClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <CartMenu
                onClose={onClose}
                onCheckoutClick={onCheckoutClick}
            />,
        )
        await user.click(screen.getByRole("button", { name: "Checkout" }))

        expect(onClose).toHaveBeenCalledOnce()
        expect(onCheckoutClick).toHaveBeenCalledOnce()
    })
})
