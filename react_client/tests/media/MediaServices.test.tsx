import { beforeEach, describe, expect, test } from "vitest"
import { screen, waitFor } from "@testing-library/react"

import {
    makeCsvFile,
    makeCsvImportResponse,
    makeProductMediaResponse,
    makeProductsMediaResponse,
    makeSaleMediaResponse,
    makeSalesMediaResponse,
    mockedAuthRequest,
} from "./MediaMock"

import { renderWithRouter } from "../utils"
import {
    useExportProductsMutation,
    useExportSalesMutation,
    useImportProductsMutation,
    useImportSalesMutation,
    usePostProductsMediaMutation,
    usePostSalesMediaMutation,
    useProductMediaQuery,
    useSaleMediaQuery,
} from "@/features/media/mediaService"

beforeEach(() => {
    mockedAuthRequest.mockReset()
})

function ProductMediaQueryHarness() {
    const query = useProductMediaQuery(1)
    return <output>{JSON.stringify(query.data ?? null)}</output>
}

describe("useProductMediaQuery", () => {
    test("requests product media and selects the media list", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeProductMediaResponse())

        renderWithRouter(<ProductMediaQueryHarness />)

        expect(await screen.findByText(/moon-orb\.png/)).toBeVisible()
        expect(mockedAuthRequest).toHaveBeenCalledWith("/products/1/media")
    })
})

function SaleMediaQueryHarness() {
    const query = useSaleMediaQuery(7)
    return <output>{JSON.stringify(query.data ?? null)}</output>
}

describe("useSaleMediaQuery", () => {
    test("requests sale media and selects the media list", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeSaleMediaResponse())

        renderWithRouter(<SaleMediaQueryHarness />)

        expect(await screen.findByText(/moon-sale\.png/)).toBeVisible()
        expect(mockedAuthRequest).toHaveBeenCalledWith("/sales/7/media")
    })
})

function PostProductsMediaHarness() {
    const mutation = usePostProductsMediaMutation()
    return (
        <button
            type="button"
            onClick={() => mutation.mutate({ productIds: [1, 2] })}
        >
            post products media
        </button>
    )
}

describe("usePostProductsMediaMutation", () => {
    test("posts product IDs", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeProductsMediaResponse())

        renderWithRouter(<PostProductsMediaHarness />)
        screen.getByRole("button").click()

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/products/media",
            {
                method: "POST",
                body: JSON.stringify({ productIds: [1, 2] }),
            },
        ))
    })
})

function PostSalesMediaHarness() {
    const mutation = usePostSalesMediaMutation()
    return (
        <button
            type="button"
            onClick={() => mutation.mutate({ saleIds: [7, 8] })}
        >
            post sales media
        </button>
    )
}

describe("usePostSalesMediaMutation", () => {
    test("posts sale IDs", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeSalesMediaResponse())

        renderWithRouter(<PostSalesMediaHarness />)
        screen.getByRole("button").click()

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/sales/media",
            {
                method: "POST",
                body: JSON.stringify({ saleIds: [7, 8] }),
            },
        ))
    })
})

function ExportProductsHarness() {
    const mutation = useExportProductsMutation()
    return (
        <button
            type="button"
            onClick={() => void mutation.mutateAsync()}
        >
            export products
        </button>
    )
}

describe("useExportProductsMutation", () => {
    test("requests a product CSV blob", async () => {
        const blob = new Blob(["id,name"], { type: "text/csv" })
        mockedAuthRequest.mockResolvedValueOnce(blob)

        renderWithRouter(<ExportProductsHarness />)
        screen.getByRole("button").click()

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/products/export",
            { responseType: "blob" },
        ))
    })
})

function ExportSalesHarness() {
    const mutation = useExportSalesMutation()
    return (
        <button
            type="button"
            onClick={() => void mutation.mutateAsync()}
        >
            export sales
        </button>
    )
}

describe("useExportSalesMutation", () => {
    test("requests a sale CSV blob", async () => {
        const blob = new Blob(["id,name"], { type: "text/csv" })
        mockedAuthRequest.mockResolvedValueOnce(blob)

        renderWithRouter(<ExportSalesHarness />)
        screen.getByRole("button").click()

        await waitFor(() => expect(mockedAuthRequest).toHaveBeenCalledWith(
            "/sales/export",
            { responseType: "blob" },
        ))
    })
})

function ImportProductsHarness() {
    const mutation = useImportProductsMutation()
    return (
        <button
            type="button"
            onClick={() => void mutation.mutateAsync({ file: makeCsvFile() })}
        >
            import products
        </button>
    )
}

describe("useImportProductsMutation", () => {
    test("uploads a product CSV as multipart form data", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeCsvImportResponse())

        renderWithRouter(<ImportProductsHarness />)
        screen.getByRole("button").click()

        await waitFor(() => {
            expect(mockedAuthRequest).toHaveBeenCalledTimes(1)
            const [endpoint, options] = mockedAuthRequest.mock.calls[0]
            expect(endpoint).toBe("/products/import")
            expect(options.method).toBe("POST")
            expect(options.body).toBeInstanceOf(FormData)
            expect(options.body.get("file").name).toBe("media.csv")
        })
    })
})

function ImportSalesHarness() {
    const mutation = useImportSalesMutation()
    return (
        <button
            type="button"
            onClick={() => void mutation.mutateAsync({ file: makeCsvFile() })}
        >
            import sales
        </button>
    )
}

describe("useImportSalesMutation", () => {
    test("uploads a sale CSV as multipart form data", async () => {
        mockedAuthRequest.mockResolvedValueOnce(makeCsvImportResponse())

        renderWithRouter(<ImportSalesHarness />)
        screen.getByRole("button").click()

        await waitFor(() => {
            expect(mockedAuthRequest).toHaveBeenCalledTimes(1)
            const [endpoint, options] = mockedAuthRequest.mock.calls[0]
            expect(endpoint).toBe("/sales/import")
            expect(options.method).toBe("POST")
            expect(options.body).toBeInstanceOf(FormData)
            expect(options.body.get("file").name).toBe("media.csv")
        })
    })
})
