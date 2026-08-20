import { beforeEach, describe, expect, test } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
    makeCsvImportResponse,
    makeMediaDetail,
    makeProductMediaResponse,
    makeSaleMediaResponse,
    mockedAuthRequest,
} from "./MediaMock"

import { renderWithRouter } from "../utils"
import {
    ExportProductsButton,
    ExportSalesButton,
    ImportProductsButton,
    ImportSalesButton,
    MediaCarouselComponent,
    MediaComponent,
    MediaImageComponent,
    MediaVideoComponent,
    ProductMediaCarouselComponent,
    SaleMediaCarouselComponent,
} from "@/features/media/mediaComponent.tsx"

beforeEach(() => {
    mockedAuthRequest.mockReset()
})

describe("MediaImageComponent", () => {
    test("renders an image URL and alt text", () => {
        const media = makeMediaDetail()

        renderWithRouter(<MediaImageComponent media={media} />)

        expect(screen.getByRole("img", { name: "Moon Orb" }))
            .toHaveAttribute("src", media.mediaUrl)
    })

    test("does not render video media", () => {
        const media = makeMediaDetail({ mediaType: "video" })

        renderWithRouter(<MediaImageComponent media={media} />)

        expect(screen.queryByRole("img")).toBeNull()
    })
})

describe("MediaVideoComponent", () => {
    test("renders a video URL and controls", () => {
        const media = makeMediaDetail({
            mediaType: "video",
            mediaUrl: "/media/moon-orb.mp4",
        })

        renderWithRouter(<MediaVideoComponent media={media} />)

        expect(screen.getByLabelText("Moon Orb"))
            .toHaveAttribute("src", media.mediaUrl)
        expect(screen.getByLabelText("Moon Orb"))
            .toHaveAttribute("controls")
    })

    test("does not render image media", () => {
        renderWithRouter(
            <MediaVideoComponent media={makeMediaDetail()} />
        )

        expect(screen.queryByLabelText("Moon Orb")).toBeNull()
    })
})

describe("MediaComponent", () => {
    test("selects the image component", () => {
        renderWithRouter(
            <MediaComponent media={makeMediaDetail()} />
        )

        expect(screen.getByRole("img", { name: "Moon Orb" })).toBeVisible()
    })

    test("selects the video component", () => {
        const media = makeMediaDetail({ mediaType: "video" })

        renderWithRouter(<MediaComponent media={media} />)

        expect(screen.getByLabelText("Moon Orb")).toBeVisible()
    })
})

describe("MediaCarouselComponent", () => {
    test("renders media children and navigation", () => {
        const media = [
            makeMediaDetail(),
            makeMediaDetail({
                id: 2,
                mediaUrl: "/media/moon-orb-2.png",
                altText: "Second Moon Orb",
            }),
        ]

        renderWithRouter(
            <MediaCarouselComponent media={media} limit={1} />
        )

        expect(screen.getByRole("img", { name: "Moon Orb" })).toBeVisible()
        expect(screen.getAllByRole("button")).toHaveLength(2)
    })

    test("renders nothing for empty media", () => {
        renderWithRouter(<MediaCarouselComponent media={[]} />)

        expect(screen.queryByRole("img")).toBeNull()
        expect(screen.queryByRole("button")).toBeNull()
    })
})

describe("ProductMediaCarouselComponent", () => {
    test("loads and renders product media", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeProductMediaResponse())

        renderWithRouter(<ProductMediaCarouselComponent productId={1} />)

        expect(await screen.findByRole("img", { name: "Moon Orb" }))
            .toBeVisible()
        expect(mockedAuthRequest).toHaveBeenCalledWith("/products/1/media")
    })
})

describe("SaleMediaCarouselComponent", () => {
    test("loads and renders sale media", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeSaleMediaResponse())

        renderWithRouter(<SaleMediaCarouselComponent saleId={7} />)

        expect(await screen.findByRole("img", { name: "Moon Sale" }))
            .toBeVisible()
        expect(mockedAuthRequest).toHaveBeenCalledWith("/sales/7/media")
    })
})

describe("ImportProductsButton", () => {
    test("uploads the selected product CSV", async () => {
        const user = userEvent.setup()
        mockedAuthRequest.mockResolvedValueOnce(makeCsvImportResponse())
        const file = new File(["id,name\n1,Moon Orb"], "products.csv", {
            type: "text/csv",
        })

        renderWithRouter(<ImportProductsButton />)
        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        if (!input) throw new Error("Expected product file input")
        await user.upload(input, file)

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/products/import",
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData),
            }),
        ))
    })
})

describe("ImportSalesButton", () => {
    test("uploads the selected sale CSV", async () => {
        const user = userEvent.setup()
        mockedAuthRequest.mockResolvedValueOnce(makeCsvImportResponse())
        const file = new File(["id,name\n7,Moon Sale"], "sales.csv", {
            type: "text/csv",
        })

        renderWithRouter(<ImportSalesButton />)
        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        if (!input) throw new Error("Expected sale file input")
        await user.upload(input, file)

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/sales/import",
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData),
            }),
        ))
    })
})

describe("ExportProductsButton", () => {
    test("renders the product export action", () => {
        renderWithRouter(<ExportProductsButton />)

        expect(screen.getByRole("button", {
            name: "Export Products",
        })).toBeVisible()
    })
})

describe("ExportSalesButton", () => {
    test("renders the sale export action", () => {
        renderWithRouter(<ExportSalesButton />)

        expect(screen.getByRole("button", {
            name: "Export Sales",
        })).toBeVisible()
    })
})
