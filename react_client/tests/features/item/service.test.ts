import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper, resetCartState } from "../../utils"
import { itemResolutionFactory } from "../../../mock_data/item"
import { productFactory } from "../../../mock_data/product"
import { server } from "@/core"
import { useResolveQuery } from "@/features/item/service"

describe("useResolveQuery intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality resolves cart items and returns the order total",
        async () => {
            const product = productFactory({ id: 12 })
            resetCartState([product])
            const resolution = itemResolutionFactory({
                product: {
                    id: product.id,
                    saleID: null,
                    name: product.name,
                    slug: product.slug,
                },
                quantity: 2,
                unitPriceCent: 1200,
                lineTotalCent: 2400,
                onSale: false,
            })
            const response = {
                items: [resolution],
                totalCent: 2400,
            }
            const resolve = vi.spyOn(server.items, "resolve")
                .mockResolvedValue(response)
            const { wrapper } = createWrapper()

            const { result } = renderHook(() => useResolveQuery(), {
                wrapper,
            })

            await waitFor(() => expect(result.current.data)
                .toEqual(response))
            expect(resolve).toHaveBeenCalledWith({
                items: [{ productId: product.id, quantity: 2 }],
            })
        },
    )

    it("sends an empty item list when the cart is empty", async () => {
        const resolve = vi.spyOn(server.items, "resolve")
            .mockResolvedValue({ items: [], totalCent: 0 })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useResolveQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual({
            items: [],
            totalCent: 0,
        }))
        expect(resolve).toHaveBeenCalledWith({ items: [] })
    })

    it("exposes a server error when item resolution fails", async () => {
        const error = new Error("Unable to resolve cart")
        vi.spyOn(server.items, "resolve").mockRejectedValue(error)
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useResolveQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.error).toBe(error))
    })
})
