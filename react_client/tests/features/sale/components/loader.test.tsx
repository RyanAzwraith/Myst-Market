import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { mediaFactory } from "../../../../mock_data/media"
import { saleAnalyticsFactory, saleFactory } from "../../../../mock_data/sale"
import { server } from "@/core"
import {
    AdminSearchLoader,
    BiggestLoader,
    SaleLoader,
} from "@/features/sale/components/loader"

describe("SaleLoader intimacy: medium", () => {
    it("functionality renders the sale returned by the server", async () => {
        const sale = saleFactory({ name: "Loaded Sale" })
        vi.spyOn(server.sale, "getBySlug").mockResolvedValue({ sale })

        renderWithRouter(
            <SaleLoader
                slug={sale.slug}
                render={loadedSale => <div>{loadedSale.name}</div>}
            />,
        )

        expect(await screen.findByText("Loaded Sale")).toBeInTheDocument()
    })
})

describe("BiggestLoader intimacy: medium", () => {
    it("functionality renders returned sales and images", async () => {
        const sale = saleFactory({ name: "Popular Sale" })
        const image = mediaFactory({ altText: "Popular image" })
        vi.spyOn(server.sales, "retrieveBiggest").mockResolvedValue({
            sales: [sale],
            images: [image],
        })

        renderWithRouter(
            <BiggestLoader
                limit={1}
                render={(sales, images) => (
                    <div>
                        {sales[0].name}
                        {images[image.entityId].altText}
                    </div>
                )}
            />,
        )

        expect(await screen.findByText("Popular SalePopular image"))
            .toBeInTheDocument()
    })
})

describe("AdminSearchLoader intimacy: high", () => {
    it("functionality passes query state and sales to the renderer", () => {
        const renderLoader = vi.fn(() => <div>admin sales</div>)

        renderWithRouter(
            <AdminSearchLoader render={renderLoader} limit={10} />,
            { initialPath: "/admin/sales" },
        )

        expect(screen.getByText("admin sales")).toBeInTheDocument()
        expect(renderLoader).toHaveBeenCalledWith(
            expect.objectContaining({
                sales: [],
            }),
        )
    })
})