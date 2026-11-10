import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../utils"
import { mediaFactory } from "../../mock_data/media"
import { saleFactory } from "../../mock_data/sale"
import { server } from "@/core"
import { SalePage } from "@/pages/sale"

describe("SalePage intimacy: high", () => {
    it("functionality renders the loaded sale page", async () => {
        const sale = saleFactory({
            id: 7,
            name: "Spring Sale",
            slug: "spring-sale",
            discountPerc: 25,
            startAt: "2026-04-01",
            endAt: "2026-04-30",
            description: "Discounts for spring adventurers.",
        })
        const media = mediaFactory({
            id: 4,
            entityId: sale.id,
            altText: "Spring sale image",
            mediaUrl: "/spring-sale.jpg",
        })
        const getBySlug = vi.spyOn(server.sale, "getBySlug")
            .mockResolvedValue({ sale })
        const getMedias = vi.spyOn(server.sale, "getMedias")
            .mockResolvedValue({ medias: [media] })

        renderWithRouter(<SalePage />, {
            path: "/sale/:slug",
            initialPath: "/sale/spring-sale",
        })

        expect(await screen.findByRole("heading", {
            name: "Spring Sale",
        })).toBeInTheDocument()
        expect(screen.getByText("25% off!")).toBeInTheDocument()
        expect(screen.getByText("2026-04-01 to 2026-04-30"))
            .toBeInTheDocument()
        expect(screen.getByText(
            "Discounts for spring adventurers.",
        )).toBeInTheDocument()
        expect(await screen.findByAltText("Spring sale image"))
            .toBeInTheDocument()

        await waitFor(() => {
            expect(getBySlug).toHaveBeenCalledWith("spring-sale")
            expect(getMedias).toHaveBeenCalledWith(7)
        })
    })

    it("shows loading while the sale is unavailable", () => {
        const getBySlug = vi.spyOn(server.sale, "getBySlug")
            .mockReturnValue(new Promise(() => {}))

        renderWithRouter(<SalePage />, {
            path: "/sale/:slug",
            initialPath: "/sale/missing-sale",
        })

        expect(screen.getByText("Loading...")).toBeInTheDocument()
        expect(getBySlug).toHaveBeenCalledWith("missing-sale")
    })

    it("redirects to the catalogue when the sale slug is missing",
        async () => {
            const getBySlug = vi.spyOn(server.sale, "getBySlug")

            renderWithRouter(<SalePage />, {
                path: "*",
                initialPath: "/",
            })

            await waitFor(() => expect(screen.getByTestId("location"))
                .toHaveTextContent("/catalogue"))
            expect(getBySlug).not.toHaveBeenCalled()
        },
    )
})
