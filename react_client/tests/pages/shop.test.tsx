import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetCartState,
} from "../utils"
import { mediaFactory } from "../../mock_data/media"
import { productFactory } from "../../mock_data/product"
import { server } from "@/core"
import { ShopPage } from "@/pages/shop"

describe("ShopPage intimacy: high", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders searched products and query filters",
        async () => {
            const firstProduct = productFactory({
                id: 1,
                name: "Ancient Amulet",
                slug: "ancient-amulet",
            })
            const secondProduct = productFactory({
                id: 2,
                name: "Healing Potion",
                slug: "healing-potion",
            })
            const images = [
                mediaFactory({
                    id: 1,
                    entityId: firstProduct.id,
                    altText: "Ancient amulet",
                }),
                mediaFactory({
                    id: 2,
                    entityId: secondProduct.id,
                    altText: "Healing potion",
                }),
            ]
            const search = vi.spyOn(server.products, "search")
                .mockResolvedValue({
                    products: [firstProduct, secondProduct],
                    images,
                    hasMore: false,
                })

            renderWithRouter(<ShopPage />, {
                path: "/shop",
                initialPath: "/shop?categories=artifacts&search=amulet",
            })

            expect(await screen.findByText("Ancient Amulet"))
                .toBeInTheDocument()
            expect(screen.getByText("Healing Potion"))
                .toBeInTheDocument()
            expect(screen.getByText("Searching: amulet"))
                .toBeInTheDocument()
            expect(screen.getByAltText("Ancient amulet"))
                .toBeInTheDocument()
            expect(screen.getByAltText("Healing potion"))
                .toBeInTheDocument()
            expect(screen.getAllByRole("button", {
                name: "Add to Cart",
            })).toHaveLength(2)
            expect(search).toHaveBeenCalledWith({
                searchParams: {
                    categories: ["artifacts"],
                    rarities: [],
                    sort: "popularity",
                    isAscending: false,
                    search: "amulet",
                },
                limit: 20,
                offset: 0,
            })
        },
    )

    it("navigates to a product when its card is selected", async () => {
        const product = productFactory({
            id: 3,
            name: "Clickable Relic",
            slug: "clickable-relic",
        })
        vi.spyOn(server.products, "search").mockResolvedValue({
            products: [product],
            images: [],
            hasMore: false,
        })
        const user = userEvent.setup()

        renderWithRouter(<ShopPage />, {
            path: "/shop",
            initialPath: "/shop",
        })

        await screen.findByText("Clickable Relic")
        await user.click(screen.getByText("Clickable Relic"))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/product/clickable-relic")
    })

    it("loads more products when the search has another page", async () => {
        const firstProduct = productFactory({
            id: 4,
            name: "First Result",
        })
        const secondProduct = productFactory({
            id: 5,
            name: "Second Result",
        })
        const search = vi.spyOn(server.products, "search")
            .mockResolvedValueOnce({
                products: [firstProduct],
                images: [],
                hasMore: true,
            })
            .mockResolvedValueOnce({
                products: [secondProduct],
                images: [],
                hasMore: false,
            })
        const user = userEvent.setup()

        renderWithRouter(<ShopPage />, {
            path: "/shop",
            initialPath: "/shop",
        })

        expect(await screen.findByText("First Result")).toBeInTheDocument()
        await user.click(screen.getByRole("button", {
            name: "Load more content",
        }))

        expect(await screen.findByText("Second Result"))
            .toBeInTheDocument()
        await waitFor(() => expect(search).toHaveBeenNthCalledWith(2, {
            searchParams: {
                categories: [],
                rarities: [],
                sort: "popularity",
                isAscending: false,
                search: "",
            },
            limit: 20,
            offset: 20,
        }))
    })
})
