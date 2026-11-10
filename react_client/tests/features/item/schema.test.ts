import { describe, expect, it } from "vitest"

import { itemResolutionFactory } from "../../../mock_data/item"
import { productFactory } from "../../../mock_data/product"
import type { Item } from "@/features/item/schema"
import { itemSummary } from "@/features/item/schema"

describe("itemSummary intimacy: low", () => {
    it("functionality maps a cart item to a product quantity summary", () => {
        const product = productFactory({ id: 14 })
        const item: Item = {
            product,
            quantity: 3,
            priceCent: 1200,
            onSale: false,
        }

        expect(itemSummary.from.item(item)).toEqual({
            productId: 14,
            quantity: 3,
        })
    })

    it("maps a resolved item to a product quantity summary", () => {
        const item = itemResolutionFactory({
            product: {
                id: 15,
                saleID: null,
                name: "Resolved Product",
                slug: "resolved-product",
            },
            quantity: 2,
        })

        expect(itemSummary.from.itemResolution(item)).toEqual({
            productId: 15,
            quantity: 2,
        })
    })
})
