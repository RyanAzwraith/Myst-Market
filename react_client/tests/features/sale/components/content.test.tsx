import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { mediaFactory } from "../../../../mock_data/media"
import {
    saleAnalyticsFactory,
    saleFactory,
} from "../../../../mock_data/sale"
import { server } from "@/core"
import {
    AdminSummaryInfo,
    AnalyticsInfo,
    DetailedInfo,
    SaleCarousel,
    SaleImage,
    SaleInfo,
} from "@/features/sale/components/content"

describe("SaleCarousel intimacy: medium", () => {
    it("functionality renders returned sale media", async () => {
        const media = mediaFactory({ altText: "Sale banner" })
        vi.spyOn(server.sale, "getMedias").mockResolvedValue({
            medias: [media],
        })

        renderWithRouter(<SaleCarousel saleId={1} />)

        expect(await screen.findByAltText("Sale banner")).toBeInTheDocument()
    })
})

describe("SaleImage intimacy: medium", () => {
    it("functionality renders the returned image", async () => {
        const media = mediaFactory({ altText: "Sale image" })
        vi.spyOn(server.sale, "getImage").mockResolvedValue({ media })

        renderWithRouter(<SaleImage saleId={1} />)

        expect(await screen.findByAltText("Sale image")).toBeInTheDocument()
    })

    it("shows loading while the image is unavailable", () => {
        vi.spyOn(server.sale, "getImage").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<SaleImage saleId={1} />)

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
})

describe("SaleInfo intimacy: low", () => {
    it("functionality displays the sale summary", () => {
        const sale = saleFactory({
            name: "Autumn Sale",
            discountPerc: 25,
            startAt: "2026-04-01",
            endAt: "2026-04-30",
        })

        renderWithRouter(<SaleInfo sale={sale} image={undefined} />)

        expect(screen.getByText("Autumn Sale")).toBeInTheDocument()
        expect(screen.getByText("25% off!")).toBeInTheDocument()
        expect(screen.getByText("2026-04-01 to 2026-04-30"))
            .toBeInTheDocument()
    })
})

describe("DetailedInfo intimacy: low", () => {
    it("functionality displays the sale description", () => {
        const sale = saleFactory({
            name: "Detailed Sale",
            description: "A limited seasonal offer.",
        })

        renderWithRouter(<DetailedInfo sale={sale} />)

        expect(screen.getByText("Detailed Sale")).toBeInTheDocument()
        expect(screen.getByText("A limited seasonal offer."))
            .toBeInTheDocument()
    })
})

describe("AdminSummaryInfo intimacy: low", () => {
    it("functionality displays analytics summary values", () => {
        const sale = saleAnalyticsFactory({
            name: "Admin Sale",
            orderCount: 12,
            revenue: 4500,
        })

        renderWithRouter(<AdminSummaryInfo sale={sale} />)

        expect(screen.getByText("Admin Sale")).toBeInTheDocument()
        expect(screen.getByText("12 orders")).toBeInTheDocument()
        expect(screen.getByText("Revenue: 4500")).toBeInTheDocument()
    })
})

describe("AnalyticsInfo intimacy: high", () => {
    it("functionality displays analytics and loads sale media", async () => {
        const sale = saleAnalyticsFactory({ name: "Analytics Sale" })
        const media = mediaFactory({ altText: "Analytics banner" })
        vi.spyOn(server.sale, "getMedias").mockResolvedValue({
            medias: [media],
        })

        renderWithRouter(<AnalyticsInfo sale={sale} />)

        expect(screen.getByText("Analytics Sale")).toBeInTheDocument()
        expect(screen.getByText(`Revenue: ${sale.revenue}`))
            .toBeInTheDocument()
        expect(await screen.findByAltText("Analytics banner"))
            .toBeInTheDocument()
    })
})