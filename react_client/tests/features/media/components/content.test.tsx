import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { mediaFactory } from "../../../../mock_data/media"
import {
    Image,
    Media,
    MediaCarousel,
    Video,
} from "@/features/media/components/content"

describe("Image intimacy: low", () => {
    it("functionality renders image media", () => {
        const media = mediaFactory({
            mediaType: "image",
            mediaUrl: "/media/product.png",
            altText: "Product image",
        })

        renderWithRouter(<Image media={media} className="product-image" />)

        const image = screen.getByRole("img", { name: "Product image" })
        expect(image).toHaveAttribute("src", media.mediaUrl)
        expect(image).toHaveClass("product-image")
    })

    it("renders an unavailable placeholder when media is missing", () => {
        renderWithRouter(<Image media={undefined} />)

        expect(screen.getByRole("img", { name: "Image unavailable" }))
            .toHaveTextContent("Image unavailable")
    })

    it("does not render video media", () => {
        const media = mediaFactory({ mediaType: "video" })

        renderWithRouter(<Image media={media} />)

        expect(screen.queryByRole("img")).not.toBeInTheDocument()
    })
})

describe("Video intimacy: low", () => {
    it("functionality renders video media with playback controls", () => {
        const media = mediaFactory({
            mediaType: "video",
            mediaUrl: "/media/product.mp4",
            altText: "Product video",
        })

        renderWithRouter(<Video media={media} />)

        const video = screen.getByLabelText("Product video")
        expect(video).toHaveAttribute("src", media.mediaUrl)
        expect(video).toHaveAttribute("controls")
        expect(video).toHaveAttribute("playsinline")
    })

    it("uses the media URL when video alt text is unavailable", () => {
        const media = mediaFactory({
            mediaType: "video",
            mediaUrl: "/media/product.mp4",
            altText: null,
        })

        renderWithRouter(<Video media={media} />)

        expect(screen.getByLabelText(media.mediaUrl)).toBeInTheDocument()
    })

    it("does not render image media", () => {
        const media = mediaFactory({ mediaType: "image" })

        renderWithRouter(<Video media={media} />)

        expect(document.querySelector("video")).not.toBeInTheDocument()
    })
})

describe("Media intimacy: low", () => {
    it("functionality renders the matching image representation", () => {
        const media = mediaFactory({
            mediaType: "image",
            altText: "Sale image",
        })

        renderWithRouter(<Media media={media} />)

        expect(screen.getByRole("img", { name: "Sale image" }))
            .toBeInTheDocument()
    })

    it("renders the matching video representation", () => {
        const media = mediaFactory({
            mediaType: "video",
            altText: "Sale video",
        })

        renderWithRouter(<Media media={media} />)

        expect(screen.getByLabelText("Sale video")).toBeInTheDocument()
    })

    it("renders an unavailable placeholder when media is missing", () => {
        renderWithRouter(<Media />)

        expect(screen.getByRole("img", { name: "Image unavailable" }))
            .toBeInTheDocument()
    })
})

describe("MediaCarousel intimacy: low", () => {
    it("functionality renders the supplied media items", () => {
        const media = [
            mediaFactory({ id: 1, altText: "First image" }),
            mediaFactory({ id: 2, altText: "Second image" }),
        ]

        renderWithRouter(
            <MediaCarousel media={media} limit={2} />,
        )

        expect(screen.getByRole("img", { name: "First image" }))
            .toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Second image" }))
            .toBeInTheDocument()
    })

    it("renders no content when the media list is empty", () => {
        renderWithRouter(<MediaCarousel media={[]} />)

        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Previous items" }))
            .not.toBeInTheDocument()
    })
})
