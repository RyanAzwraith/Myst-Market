import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetCartState,
} from "../utils"
import { mediaFactory } from "../../mock_data/media"
import { productFactory } from "../../mock_data/product"
import { reviewFactory } from "../../mock_data/review"
import { saleFactory } from "../../mock_data/sale"
import { server } from "@/core"
import { CataloguePage } from "@/pages/catalogue"

function mockCatalogueData() {
    const featured = productFactory({
        id: 11,
        name: "Featured Relic",
        slug: "featured-relic",
    })
    const popular = productFactory({
        id: 12,
        name: "Popular Relic",
        slug: "popular-relic",
    })
    const newest = productFactory({
        id: 13,
        name: "Newest Relic",
        slug: "newest-relic",
    })
    const sale = saleFactory({
        id: 21,
        name: "Biggest Sale",
        slug: "biggest-sale",
        discountPerc: 30,
    })
    const testimonial = reviewFactory({
        id: 31,
        userName: "Avery Adventurer",
        description: "A remarkable relic.",
    })

    const getStats = vi.spyOn(server.app, "getStats")
        .mockResolvedValue({
            stats: {
                product_count: 24,
                customer_count: 18,
                total_average_rating: 4.2,
            },
        })
    const retrieveFeatured = vi.spyOn(
        server.products,
        "retrieveFeatured",
    ).mockResolvedValue({
        products: [featured],
        images: [
            mediaFactory({
                entityId: featured.id,
                altText: "Featured relic image",
            }),
        ],
    })
    const retrievePopular = vi.spyOn(
        server.products,
        "retrievePopular",
    ).mockResolvedValue({
        products: [popular],
        images: [
            mediaFactory({
                entityId: popular.id,
                altText: "Popular relic image",
            }),
        ],
    })
    const retrieveNewest = vi.spyOn(
        server.products,
        "retrieveNewest",
    ).mockResolvedValue({
        products: [newest],
        images: [
            mediaFactory({
                entityId: newest.id,
                altText: "Newest relic image",
            }),
        ],
    })
    const retrieveBiggest = vi.spyOn(
        server.sales,
        "retrieveBiggest",
    ).mockResolvedValue({
        sales: [sale],
        images: [
            mediaFactory({
                entityId: sale.id,
                entityType: "sale",
                altText: "Biggest sale image",
            }),
        ],
    })
    const retrieveTestimonials = vi.spyOn(
        server.reviews,
        "retrieveTestimonials",
    ).mockResolvedValue({ reviews: [testimonial] })

    return {
        featured,
        sale,
        getStats,
        retrieveFeatured,
        retrievePopular,
        retrieveNewest,
        retrieveBiggest,
        retrieveTestimonials,
    }
}

describe("CataloguePage intimacy: high", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders catalogue sections and loaded content",
        async () => {
            const requests = mockCatalogueData()

            renderWithRouter(<CataloguePage />, {
                path: "/catalogue",
                initialPath: "/catalogue",
            })

            expect(screen.getByRole("heading", {
                name: "Catalogue",
            })).toBeInTheDocument()
            expect(screen.getByText(
                "Wow Such Wow About Us Wow",
            )).toBeInTheDocument()
            expect(await screen.findByText("24")).toBeInTheDocument()
            expect(screen.getByText("Featured Products"))
                .toBeInTheDocument()
            expect(screen.getByText("Popular Products"))
                .toBeInTheDocument()
            expect(screen.getByText("Newest Products"))
                .toBeInTheDocument()
            expect(screen.getByText("Biggest Sales"))
                .toBeInTheDocument()
            expect(screen.getByText("Testimonials"))
                .toBeInTheDocument()
            expect(screen.getByText("Featured Relic"))
                .toBeInTheDocument()
            expect(screen.getByText("Popular Relic"))
                .toBeInTheDocument()
            expect(screen.getByText("Newest Relic"))
                .toBeInTheDocument()
            expect(screen.getByText("Biggest Sale"))
                .toBeInTheDocument()
            expect(screen.getByText("A remarkable relic."))
                .toBeInTheDocument()

            await waitFor(() => {
                expect(requests.getStats).toHaveBeenCalledOnce()
                expect(requests.retrieveFeatured)
                    .toHaveBeenCalledWith({ limit: 15 })
                expect(requests.retrievePopular)
                    .toHaveBeenCalledWith({ limit: 15 })
                expect(requests.retrieveNewest)
                    .toHaveBeenCalledWith({ limit: 15 })
                expect(requests.retrieveBiggest)
                    .toHaveBeenCalledWith({ limit: 3 })
                expect(requests.retrieveTestimonials)
                    .toHaveBeenCalledWith({ limit: 3 })
            })
        },
    )

    it("navigates to a product from the featured section", async () => {
        const { featured } = mockCatalogueData()
        const user = userEvent.setup()

        renderWithRouter(<CataloguePage />, {
            path: "/catalogue",
            initialPath: "/catalogue",
        })

        await user.click(await screen.findByText(featured.name))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/product/featured-relic")
    })

    it("navigates to a sale from the biggest-sales section", async () => {
        const { sale } = mockCatalogueData()
        const user = userEvent.setup()

        renderWithRouter(<CataloguePage />, {
            path: "/catalogue",
            initialPath: "/catalogue",
        })

        await user.click(await screen.findByText(sale.name))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/sale/biggest-sale")
    })
})
