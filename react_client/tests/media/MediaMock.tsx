import { vi } from "vitest"

import type {
    CsvImportResponse,
    GetProductMediaResponse,
    GetSaleMediaResponse,
    MediaDetail,
    RetrieveProductsMediaResponse,
    RetrieveSalesMediaResponse,
} from "@/features/media/mediaSchema"

const mocks = vi.hoisted(() => ({
    mockedAuthRequest: vi.fn(),
}))

export const { mockedAuthRequest } = mocks

vi.mock("@/api", () => ({
    authRequest: mockedAuthRequest,
}))

function makeMediaDetail(
    overrides: Partial<MediaDetail> = {}
): MediaDetail {
    return {
        id: 1,
        mediaType: "image",
        mediaUrl: "/media/moon-orb.png",
        entityId: 1,
        entityType: "product",
        altText: "Moon Orb",
        sortOrder: 0,
        ...overrides,
    }
}

function makeProductMediaResponse(
    media: MediaDetail[] = [makeMediaDetail()]
): GetProductMediaResponse {
    return { media }
}

function makeSaleMediaResponse(
    media: MediaDetail[] = [makeMediaDetail({
        entityId: 7,
        entityType: "sale",
        mediaUrl: "/media/moon-sale.png",
        altText: "Moon Sale",
    })]
): GetSaleMediaResponse {
    return { media }
}

function makeProductsMediaResponse(
    media: Record<number, MediaDetail> = {
        1: makeMediaDetail(),
    }
): RetrieveProductsMediaResponse {
    return { media }
}

function makeSalesMediaResponse(
    media: Record<number, MediaDetail> = {
        7: makeMediaDetail({
            entityId: 7,
            entityType: "sale",
            mediaUrl: "/media/moon-sale.png",
        }),
    }
): RetrieveSalesMediaResponse {
    return { media }
}

function makeCsvImportResponse(
    overrides: Partial<CsvImportResponse> = {}
): CsvImportResponse {
    return {
        imported: 2,
        updated: 1,
        failed: 0,
        errors: [],
        ...overrides,
    }
}

function makeCsvFile(name = "media.csv") {
    return new File(["id,name\n1,Moon Orb"], name, {
        type: "text/csv",
    })
}

export {
    makeCsvFile,
    makeCsvImportResponse,
    makeMediaDetail,
    makeProductMediaResponse,
    makeProductsMediaResponse,
    makeSaleMediaResponse,
    makeSalesMediaResponse,
}
