import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetAuthState,
    resetCartState,
} from "../utils"
import { mediaFactory } from "../../mock_data/media"
import { productFactory } from "../../mock_data/product"
import { server } from "@/core"
import { ProductPage } from "@/pages/product"

describe("ProductPage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
        resetCartState([])
    })

    it("functionality renders the loaded product page", async () => {
        const product = productFactory({
            id: 42,
            name: "Ancient Amulet",
            slug: "ancient-amulet",
            categoryName: "artifacts",
            rarityName: "rare",
            stock: 7,
            description: "A protective amulet from a lost kingdom.",
            priceAudCent: 2500,
        })
        const media = mediaFactory({
            id: 9,
            entityId: product.id,
            altText: "Ancient amulet image",
            mediaUrl: "/amulet.jpg",
        })
        const getBySlug = vi.spyOn(server.product, "getBySlug")
            .mockResolvedValue({ product })
        const getMedias = vi.spyOn(server.product, "getMedias")
            .mockResolvedValue({ medias: [media] })
        const getReviews = vi.spyOn(server.product, "getReviews")
            .mockResolvedValue({
                reviews: [],
                average: 0,
                userHasReview: false,
            })

        renderWithRouter(<ProductPage />, {
            path: "/product/:slug",
            initialPath: "/product/ancient-amulet",
        })

        expect(await screen.findByRole("heading", {
            name: "Ancient Amulet",
        })).toBeInTheDocument()
        expect(screen.getByText("artifacts - rare")).toBeInTheDocument()
        expect(screen.getByText("Stock 7")).toBeInTheDocument()
        expect(screen.getByText(
            "A protective amulet from a lost kingdom.",
        )).toBeInTheDocument()
        expect(await screen.findByAltText("Ancient amulet image"))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Add to Cart" }))
            .toBeInTheDocument()

        await waitFor(() => {
            expect(getBySlug).toHaveBeenCalledWith("ancient-amulet")
            expect(getMedias).toHaveBeenCalledWith(42)
            expect(getReviews).toHaveBeenCalledWith(42)
        })
    })

    it("shows loading while the product is unavailable", () => {
        const getBySlug = vi.spyOn(server.product, "getBySlug")
            .mockReturnValue(new Promise(() => {}))

        renderWithRouter(<ProductPage />, {
            path: "/product/:slug",
            initialPath: "/product/missing-product",
        })

        expect(screen.getByText("Loading...")).toBeInTheDocument()
        expect(getBySlug).toHaveBeenCalledWith("missing-product")
    })

    it("redirects to the shop when the product slug is missing", async () => {
        const getBySlug = vi.spyOn(server.product, "getBySlug")

        renderWithRouter(<ProductPage />, {
            path: "*",
            initialPath: "/",
        })

        await waitFor(() => expect(screen.getByTestId("location"))
            .toHaveTextContent("/shop"))
        expect(getBySlug).not.toHaveBeenCalled()
    })

    it("navigates to the sale page when the sale is selected", async () => {
        const product = productFactory({
            id: 15,
            name: "Sale Product",
            slug: "sale-product",
            priceAudCent: 2500,
            discountedPrice: 2000,
            sale: {
                name: "Spring Sale",
                slug: "spring-sale",
                discountPerc: 20,
            },
        })
        vi.spyOn(server.product, "getBySlug")
            .mockResolvedValue({ product })
        vi.spyOn(server.product, "getMedias")
            .mockResolvedValue({ medias: [] })
        vi.spyOn(server.product, "getReviews")
            .mockResolvedValue({
                reviews: [],
                average: 0,
                userHasReview: false,
            })
        const user = userEvent.setup()

        renderWithRouter(<ProductPage />, {
            path: "/product/:slug",
            initialPath: "/product/sale-product",
        })

        await screen.findByRole("heading", { name: "Sale Product" })
        await user.click(screen.getByRole("button", {
            name: /Spring Sale/,
        }))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/sale/spring-sale")
    })
})