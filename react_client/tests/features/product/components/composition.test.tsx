import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetAuthState,
    resetCartState,
} from "../../../utils"
import { mockAccessToken } from "../../../../mock_data/auth"
import { mediaFactory } from "../../../../mock_data/media"
import { productFactory } from "../../../../mock_data/product"
import { reviewFactory } from "../../../../mock_data/review"
import { userFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    CardCarousel,
    ProductCard,
    ReviewsSection,
} from "@/features/product/components/composition"
import { useAuthState } from "@/features/auth/state"

describe("ProductCard intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders product information and cart action", () => {
        const product = productFactory({ name: "Ancient Amulet" })
        const image = mediaFactory({ altText: "Amulet image" })

        renderWithRouter(
            <ProductCard product={product} image={image} />,
        )

        expect(screen.getByText("Ancient Amulet")).toBeInTheDocument()
        expect(screen.getByAltText("Amulet image")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Add to Cart" }))
            .toBeInTheDocument()
    })

    it("calls onClick with the product when the card is selected",
        async () => {
            const product = productFactory({ name: "Clickable Product" })
            const onClick = vi.fn()
            const user = userEvent.setup()

            renderWithRouter(
                <ProductCard product={product} image={undefined}
                    onClick={onClick} />,
            )
            await user.click(screen.getByText("Clickable Product"))

            expect(onClick).toHaveBeenCalledWith(product)
        },
    )
})

describe("CardCarousel intimacy: medium", () => {
    beforeEach(() => {
        resetCartState([])
    })

    it("functionality renders the visible product cards", () => {
        const products = [
            productFactory({ id: 1, name: "First Product" }),
            productFactory({ id: 2, name: "Second Product" }),
        ]
        const images = {
            1: mediaFactory({ entityId: 1 }),
            2: mediaFactory({ entityId: 2 }),
        }

        renderWithRouter(
            <CardCarousel
                products={products}
                images={images}
                limit={2}
            />,
        )

        expect(screen.getByText("First Product")).toBeInTheDocument()
        expect(screen.getByText("Second Product")).toBeInTheDocument()
    })
})

describe("ReviewsSection intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders reviews for a product", async () => {
        const reviews = [reviewFactory({
            description: "A useful product.",
        })]
        vi.spyOn(server.product, "getReviews").mockResolvedValue({
            reviews,
            average: 4,
            userHasReview: false,
        })

        renderWithRouter(<ReviewsSection productId={4} />)

        expect(await screen.findByText("Reviews")).toBeInTheDocument()
        expect(screen.getByText("Average rating")).toBeInTheDocument()
        expect(screen.getByText("A useful product.")).toBeInTheDocument()
    })

    it("offers the review form to a logged-in user without reviews",
        async () => {
            const user = userFactory()
            useAuthState.getState().login(mockAccessToken, user)
            vi.spyOn(server.product, "getReviews").mockResolvedValue({
                reviews: [],
                average: 0,
                userHasReview: false,
            })

            renderWithRouter(<ReviewsSection productId={4} />)

            expect(await screen.findByText(
                "Be the first to review this product.",
            )).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Submit" }))
                .toBeInTheDocument()
        },
    )

    it("hides the review form when the logged-in user already reviewed",
        async () => {
            const user = userFactory()
            useAuthState.getState().login(mockAccessToken, user)
            vi.spyOn(server.product, "getReviews").mockResolvedValue({
                reviews: [reviewFactory({
                    description: "Existing review.",
                })],
                average: 5,
                userHasReview: true,
            })

            renderWithRouter(<ReviewsSection productId={4} />)

            expect(await screen.findByText("Existing review."))
                .toBeInTheDocument()
            expect(screen.queryByText("Share your experience"))
                .not.toBeInTheDocument()
        },
    )

    it("does not show review content to a logged-out user without reviews",
        async () => {
            vi.spyOn(server.product, "getReviews").mockResolvedValue({
                reviews: [],
                average: 0,
                userHasReview: false,
            })

            renderWithRouter(<ReviewsSection productId={4} />)

            await vi.waitFor(() => expect(
                server.product.getReviews,
            ).toHaveBeenCalledWith(4))
            expect(screen.queryByText("Reviews"))
                .not.toBeInTheDocument()
            expect(screen.queryByText("Share your experience"))
                .not.toBeInTheDocument()
        },
    )
})
