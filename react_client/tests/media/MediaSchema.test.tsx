import { describe, expect, test } from "vitest"

import {
    EntityType,
    MediaType,
    type CsvImportResponse,
    type MediaDetail,
} from "@/features/media/mediaSchema"

import {
    makeCsvImportResponse,
    makeMediaDetail,
} from "./MediaMock"

describe("MediaType", () => {
    test("contains image and video values", () => {
        expect(MediaType).toEqual({
            IMAGE: "image",
            VIDEO: "video",
        })
    })
})

describe("EntityType", () => {
    test("contains product and sale values", () => {
        expect(EntityType).toEqual({
            PRODUCT: "product",
            SALE: "sale",
        })
    })
})

describe("MediaDetail", () => {
    test("contains a direct media URL", () => {
        const media: MediaDetail = makeMediaDetail()

        expect(media.mediaUrl).toBe("/media/moon-orb.png")
        expect(media).not.toHaveProperty("fileName")
    })

    test("allows nullable alt text and sort order", () => {
        const media: MediaDetail = makeMediaDetail({
            altText: null,
            sortOrder: null,
        })

        expect(media.altText).toBeNull()
        expect(media.sortOrder).toBeNull()
    })
})

describe("CsvImportResponse", () => {
    test("describes a successful import", () => {
        const response: CsvImportResponse = makeCsvImportResponse()

        expect(response.imported).toBe(2)
        expect(response.updated).toBe(1)
        expect(response.failed).toBe(0)
        expect(response.errors).toEqual([])
    })

    test("describes row errors", () => {
        const response = makeCsvImportResponse({
            failed: 1,
            errors: [{
                row: 3,
                field: "name",
                message: "Name is required",
            }],
        })

        expect(response.errors[0]).toEqual({
            row: 3,
            field: "name",
            message: "Name is required",
        })
    })
})
