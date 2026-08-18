import { describe, vi, test, expect, it, beforeEach,} from "vitest"
import { screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"
import { 
    renderWithRouter,
} from "../utils";

import { useNavigate } from "react-router-dom";

import { AppRoutes } from "@/AppRoutes"
import { CarouselComponent } from "@/shared/CarouselComponent"
import { ImageComponent } from "@/shared/ImageComponent";
import { PriceComponent } from "@/features/shop/PriceComponent";
import { RatingComponent } from "@/features/review/RatingComponent"
import type { ProductDetail } from "@/features/shop/shopSchemas"
import type { ReviewDetail } from "@/features/review/ReviewSchemas"
import type { SaleDetail } from "@/features/shop/shopSchemas";

import { 
    useFeaturedProductQuery, 
    useNewestProductsQuery, 
    usePopularProductsQuery, 
    useStatsQuery,
    useTestimonialsQuery,
    useBiggestSalesQuery
} from "@/features/catalogue/catalogueService"

import { 
    CataloguePage,
    AboutSection,
    StatsSection,
    FeaturedProductSection,
    PopularProductsSection,
    NewestProductsSection,
    BiggestSalesSection,
    TestimonialsSection,
    ProductCard,
    ReviewCard,
    SaleCard,
} from "@/features/catalogue/CataloguePage" 
import type { StatsDetail } from "@/features/catalogue/catalogueSchemas";
import { formatMoney } from "@/utils/formatMoney";

const mockRequest = vi.hoisted(() => vi.fn())
vi.mock('@/api', async () => ({
    request: mockRequest 
}))

let user: UserEvent

const sampleStats = {
    product_count: 500,
    customer_count: 1000,
    total_average_rating: 4.5,
} as StatsDetail

const sampleProduct = {
    id: 1,
    name: "Sword of Dawn",
    categoryName: 'catOne',
    rarityName: 'rarityOne',
    priceAudCent: 10000,
    slug: "sword-of-dawn",
    description: "Ancient enchanted sword",
    discountedPrice: null,
    sale: null
} as ProductDetail

const now = new Date()
const nextYear = new Date(now)
nextYear.setFullYear(nextYear.getFullYear() + 1)

const sampleReview = {
    reviewId: 1,
    userName: "mick",
    productId: 1,
    createdAt: now,
    rating: 4,
    description: "Really great product",
} as ReviewDetail

const sampleSale = {
    id: 1,
    name: 'summer sale',
    slug: 'summer-sale',
    description: 'description',
    discountPercent: 20,
    startAt: now,
    endAt: nextYear
} as SaleDetail


describe("CataloguePage", () => {
    it("s fine", () => {})
}) 

describe("AboutSection", () => {

    beforeEach(async () => {
        renderWithRouter(
            <AboutSection />,
        )
        user = userEvent.setup()
    })

    test("about paragraph is shown", async () => {
        expect(await screen.findByText(/Wow Such Wow/)).toBeVisible()
    })
}) 


describe("StatsSection", () => {

    beforeEach(async () => {
        mockRequest.mockResolvedValue({stats: sampleStats})
        renderWithRouter(
            <StatsSection />,
        )
        user = userEvent.setup()
    })

    test("stat info Shown", async () => {
        expect(await screen.findByText((content) =>
            content.includes(String(sampleStats.product_count)),
        )).toBeVisible()
        expect(await screen.findByText((content) =>
            content.includes(String(sampleStats.customer_count))
        )).toBeVisible()
        expect(await screen.findByText((content) =>
            content.includes(String(sampleStats.total_average_rating))
        )).toBeVisible()
    })
}) 


describe("FeaturedProductSection", () => {

    beforeEach(async () => {
        mockRequest.mockResolvedValue({product: sampleProduct})
        renderWithRouter(
            <FeaturedProductSection />,
        )
        user = userEvent.setup()
    })

    test("product info Shown", async () => {
        expect(await screen.findByText(sampleProduct.name))
        expect(await screen.findByText(formatMoney(sampleProduct.priceAudCent)))
    })
}) 


describe("PopularProductsSection", () => {
    beforeEach(async () => {
        mockRequest.mockResolvedValue({
            products: [sampleProduct, sampleProduct, sampleProduct]
        })
        renderWithRouter(
            <PopularProductsSection limit={3}/>,
        )
        user = userEvent.setup()
    })
    test("proudcts are shown", async () => {
        expect(await screen.findAllByText(sampleProduct.name))
            .toHaveLength(3)
    })
})


describe("NewestProductsSection", () => {

    beforeEach(async () => {
        mockRequest.mockResolvedValue({
            products: [sampleProduct, sampleProduct, sampleProduct]
        })
        renderWithRouter(
            <NewestProductsSection limit={3}/>,
        )
        user = userEvent.setup()
    })

    test("proudcts are shown", async () => {
        expect(await screen.findAllByText(sampleProduct.name))
            .toHaveLength(3)
    })
})


describe("BiggestSalesSection", () => {

    beforeEach(async () => {
        mockRequest.mockResolvedValue({
            sales: [sampleSale, sampleSale, sampleSale]
        })
        renderWithRouter(
            <BiggestSalesSection limit={3}/>,
        )
        user = userEvent.setup()
    })

    test("sales are shown", async () => {
        expect(await screen.findAllByText(sampleSale.name))
            .toHaveLength(3)
    })
})

describe("TestimonialsSection", () => {

    beforeEach(async () => {
        mockRequest.mockResolvedValue({
            reviews: [sampleReview, sampleReview, sampleReview]
        })
        renderWithRouter(
            <TestimonialsSection limit={3}/>,
        )
        user = userEvent.setup()
    })

    test("reviews are shown", async () => {
        await expect(await screen.findAllByText(sampleReview.description!))
            .toHaveLength(3)
    })
})