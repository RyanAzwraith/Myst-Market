import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter, resetCartState } from "../../../utils"
import { itemResolutionFactory } from "../../../../mock_data/item"
import { server } from "@/core"
import { ResolutionLoader } from "@/features/item/components/loader"

describe("ResolutionLoader intimacy: high", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders resolved items and reports summaries",
        async () => {
            const resolution = itemResolutionFactory({
                product: {
                    id: 8,
                    saleID: null,
                    name: "Resolved Product",
                    slug: "resolved-product",
                },
                quantity: 2,
                unitPriceCent: 1250,
                lineTotalCent: 2500,
                onSale: false,
            })
            const resolve = vi.spyOn(server.items, "resolve")
                .mockResolvedValue({
                    items: [resolution],
                    totalCent: 2500,
                })
            const onSuccess = vi.fn()

            renderWithRouter(
                <ResolutionLoader
                    onSuccess={onSuccess}
                    render={({ items, totalCent }) => (
                        <p>
                            {items[0].product.name}: {totalCent}
                        </p>
                    )}
                />,
            )

            expect(await screen.findByText(
                "Resolved Product: 2500",
            )).toBeInTheDocument()
            expect(resolve).toHaveBeenCalledWith({ items: [] })
            await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledWith([
                {
                    productId: 8,
                    quantity: 2,
                },
            ]))
        },
    )

    it("shows loading while item resolution is pending", () => {
        vi.spyOn(server.items, "resolve").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <ResolutionLoader render={() => <p>Loaded</p>} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
