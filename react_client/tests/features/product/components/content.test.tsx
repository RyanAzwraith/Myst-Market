import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { mediaFactory } from "../../../../mock_data/media"
import { productAnalyticsFactory, productFactory } from "../../../../mock_data/product"
import { server } from "@/core"
import {
    AdminSummaryInfo,
    AnalyticsInfo,
    DetailedInfo,
    PerformanceInfo,
    ProductCarousel,
    ProductImage,
    SummaryInfo,
} from "@/features/product/components/content"

describe("ProductCarousel intimacy: medium", () => {
    it("functionality renders media returned for the product", async () => {
        const media = mediaFactory({ altText: "Product gallery" })
        vi.spyOn(server.product, "getMedias")
            .mockResolvedValue({ medias: [media] })

        renderWithRouter(<ProductCarousel productId={4} />)

        expect(await screen.findByAltText("Product gallery"))
            .toBeInTheDocument()
    })

    it("shows loading while product media is unavailable", () => {
        vi.spyOn(server.product, "getMedias").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<ProductCarousel productId={4} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("ProductImage intimacy: medium", () => {
    it("functionality renders the product image", async () => {
        const media = mediaFactory({ altText: "Product image" })
        vi.spyOn(server.product, "getImage")
            .mockResolvedValue({ media })

        renderWithRouter(<ProductImage productId={4} />)

        expect(await screen.findByAltText("Product image"))
            .toBeInTheDocument()
    })

    it("shows loading while the product image is unavailable", () => {
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<ProductImage productId={4} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("SummaryInfo intimacy: low", () => {
    it("functionality renders product summary information", () => {
        const product = productFactory({
            name: "Ancient Amulet",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2500,
        })
        const media = mediaFactory({ altText: "Amulet image" })

        renderWithRouter(<SummaryInfo product={product} image={media} />)

        expect(screen.getByAltText("Amulet image")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Ancient Amulet" }))
            .toBeInTheDocument()
        expect(screen.getByText("artifacts - rare")).toBeInTheDocument()
        expect(screen.getByText("$ 2500.00")).toBeInTheDocument()
    })
})

describe("DetailedInfo intimacy: low", () => {
    it("functionality renders product details and sale pricing", () => {
        const sale = {
            name: "Spring Sale",
            slug: "spring-sale",
            discountPerc: 20,
        }
        const product = productFactory({
            name: "Discounted Amulet",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2500,
            discountedPrice: 2000,
            sale,
            stock: 7,
            description: "A discounted magical amulet.",
        })

        renderWithRouter(<DetailedInfo product={product} />)

        expect(screen.getByRole("heading", {
            name: "Discounted Amulet",
        })).toBeInTheDocument()
        expect(screen.getByText("artifacts - rare")).toBeInTheDocument()
        expect(screen.getByText("Stock 7")).toBeInTheDocument()
        expect(screen.getByText("A discounted magical amulet."))
            .toBeInTheDocument()
        expect(screen.getByText("Spring Sale")).toBeInTheDocument()
        expect(screen.getByText("$ 2000.00")).toBeInTheDocument()
    })

    it("calls onSaleClick when sale pricing is selected", async () => {
        const sale = {
            name: "Spring Sale",
            slug: "spring-sale",
            discountPerc: 20,
        }
        const product = productFactory({
            priceAudCent: 2500,
            discountedPrice: 2000,
            sale,
        })
        const onSaleClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <DetailedInfo
                product={product}
                onSaleClick={onSaleClick}
            />,
        )
        await user.click(screen.getByRole("button"))

        expect(onSaleClick).toHaveBeenCalledWith(sale)
    })
})

describe("AdminSummaryInfo intimacy: low", () => {
    it("functionality renders the admin product summary", () => {
        const product = productFactory({
            name: "Admin Product",
            categoryName: "weapons",
            rarityName: "epic",
            priceAudCent: 4200,
            stock: 11,
        })

        renderWithRouter(<AdminSummaryInfo product={product} />)

        expect(screen.getByText("Admin Product")).toBeInTheDocument()
        expect(screen.getByText("weapons - epic")).toBeInTheDocument()
        expect(screen.getByText("$ 4200.00")).toBeInTheDocument()
        expect(screen.getByText("Stock: 11")).toBeInTheDocument()
    })
})

describe("AnalyticsInfo intimacy: high", () => {
    it("functionality renders analytics and product media", async () => {
        const product = productAnalyticsFactory({
            id: 9,
            name: "Analytics Product",
            slug: "analytics-product",
            categoryName: "artifacts",
            rarityName: "legendary",
            priceAudCent: 5000,
            discountedPrice: 4000,
            createdAt: "2026-05-01",
            unitsSold: 12,
            revenue: 6000,
            orderCount: 8,
            refunds: 1,
            revenueLost: 200,
            averageRating: 4.5,
            reviews: 6,
            description: "Analytics product description.",
        })
        const media = mediaFactory({
            entityId: product.id,
            altText: "Analytics product image",
        })
        vi.spyOn(server.product, "getAnalytics")
            .mockResolvedValue({ product })
        vi.spyOn(server.product, "getMedias")
            .mockResolvedValue({ medias: [media] })

        renderWithRouter(<AnalyticsInfo productId={product.id} />)

        expect(await screen.findByAltText("Analytics product image"))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Analytics Product",
        })).toBeInTheDocument()
        expect(screen.getByText("ID: 9")).toBeInTheDocument()
        expect(screen.getByText("Slug: analytics-product"))
            .toBeInTheDocument()
        expect(screen.getByText("Category: artifacts"))
            .toBeInTheDocument()
        expect(screen.getByText("Rarity: legendary"))
            .toBeInTheDocument()
        expect(screen.getByText(/Price:/))
            .toHaveTextContent("Price: $ 5000.00")
        expect(screen.getByText(/Discounted:/))
            .toHaveTextContent("Discounted: $ 4000.00")
        expect(screen.getByText("Created At: 2026-05-01"))
            .toBeInTheDocument()
        expect(screen.getByText("Stock: " + product.stock))
            .toBeInTheDocument()
        expect(screen.getByText("Units Sold: 12")).toBeInTheDocument()
        expect(screen.getByText(/Revenue:/))
            .toHaveTextContent("Revenue: $ 6000.00")
        expect(screen.getByText("Orders: 8")).toBeInTheDocument()
        expect(screen.getByText("Refunds: 1")).toBeInTheDocument()
        expect(screen.getByText(/Revenue Lost:/))
            .toHaveTextContent("Revenue Lost: $ 200.00")
        expect(screen.getByText("Average Rating: 4.5"))
            .toBeInTheDocument()
        expect(screen.getByText("Reviews: 6")).toBeInTheDocument()
        expect(screen.getByText("Analytics product description."))
            .toBeInTheDocument()
    })
})

describe("PerformanceInfo intimacy: low", () => {
    it("functionality renders product performance values", () => {
        const product = productAnalyticsFactory({
            name: "Performance Product",
            orderCount: 14,
        })

        renderWithRouter(<PerformanceInfo product={product} />)

        expect(screen.getByText("Performance Product"))
            .toBeInTheDocument()
        expect(screen.getByText("14")).toBeInTheDocument()
    })
})
