import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { itemResolutionFactory } from "../../../../mock_data/item"
import { productFactory } from "../../../../mock_data/product"
import { server } from "@/core"
import {
    ItemInfo,
    ResolutionInfo,
} from "@/features/item/components/content"

describe("ItemInfo intimacy: medium", () => {
    beforeEach(() => {
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders item pricing and quantity", () => {
        const product = productFactory({
            id: 12,
            name: "Ancient Amulet",
        })
        const item = {
            product,
            quantity: 2,
            priceCent: 1500,
            onSale: false,
        }

        renderWithRouter(<ItemInfo item={item} />)

        expect(screen.getByRole("heading", {
            name: "Ancient Amulet",
        })).toBeInTheDocument()
        expect(screen.getByText(/each/))
            .toHaveTextContent("$ 1500.00 each")
        expect(screen.getByText("2x")).toBeInTheDocument()
        expect(screen.getByText(/total/))
            .toHaveTextContent("$ 3000.00 total")
    })

    it("uses the product name and price supplied by the cart item",
        () => {
            const product = productFactory({
                id: 13,
                name: "Discounted Potion",
            })
            const item = {
                product,
                quantity: 3,
                priceCent: 800,
                onSale: true,
            }

            renderWithRouter(<ItemInfo item={item} />)

            expect(screen.getByRole("heading", {
                name: "Discounted Potion",
            })).toBeInTheDocument()
            expect(screen.getByText(/each/))
                .toHaveTextContent("$ 800.00 each")
            expect(screen.getByText(/total/))
                .toHaveTextContent("$ 2400.00 total")
        },
    )
})

describe("ResolutionInfo intimacy: medium", () => {
    beforeEach(() => {
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality renders resolved item pricing and quantity", () => {
        const item = itemResolutionFactory({
            product: {
                id: 21,
                saleID: null,
                name: "Resolved Amulet",
                slug: "resolved-amulet",
            },
            quantity: 2,
            unitPriceCent: 1750,
            lineTotalCent: 3500,
            onSale: false,
        })

        renderWithRouter(<ResolutionInfo item={item} />)

        expect(screen.getByRole("heading", {
            name: "Resolved Amulet",
        })).toBeInTheDocument()
        expect(screen.getByText(/each/))
            .toHaveTextContent("$ 1750.00 each")
        expect(screen.getByText("2x")).toBeInTheDocument()
        expect(screen.getByText(/total/))
            .toHaveTextContent("$ 3500.00 total")
    })
})
