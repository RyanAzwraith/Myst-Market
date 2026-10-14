import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { mediaFactory } from "../../../mock_data/media"
import {
    saleAnalyticsFactory,
    saleFactory,
} from "../../../mock_data/sale"
import { server } from "@/core"
import type { AdminSearchParams } from "@/features/sale/schema"
import {
    useAdminSearchQuery,
    useAnalyticsQuery,
    useBiggestQuery,
    useDeleteMutation,
    useExportMutation,
    useImageQuery,
    useImportMutation,
    useMediasQuery,
    usePatchManyMutation,
    usePatchMutation,
    usePostMutation,
    useSaleQuery,
} from "@/features/sale/service"

describe("useSaleQuery intimacy: medium", () => {
    it("functionality selects the sale from the response", async () => {
        const sale = saleFactory()
        vi.spyOn(server.sale, "getBySlug").mockResolvedValue({ sale })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useSaleQuery(sale.slug), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(sale))
        expect(server.sale.getBySlug).toHaveBeenCalledWith(sale.slug)
    })
})

describe("useImageQuery intimacy: medium", () => {
    it("functionality selects media from the response", async () => {
        const media = mediaFactory()
        vi.spyOn(server.sale, "getImage").mockResolvedValue({ media })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useImageQuery(4), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(media))
        expect(server.sale.getImage).toHaveBeenCalledWith(4)
    })
})

describe("useMediasQuery intimacy: medium", () => {
    it("functionality selects the media list", async () => {
        const medias = [mediaFactory(), mediaFactory({ id: 2 })]
        vi.spyOn(server.sale, "getMedias").mockResolvedValue({ medias })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useMediasQuery(4), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(medias))
        expect(server.sale.getMedias).toHaveBeenCalledWith(4)
    })
})

describe("useAnalyticsQuery intimacy: medium", () => {
    it("functionality selects sale analytics", async () => {
        const sale = saleAnalyticsFactory()
        vi.spyOn(server.sale, "getAnalytics").mockResolvedValue({ sale })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAnalyticsQuery(4), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(sale))
        expect(server.sale.getAnalytics).toHaveBeenCalledWith(4)
    })
})

describe("useBiggestQuery intimacy: medium", () => {
    it("functionality indexes returned images by entity id", async () => {
        const sale = saleFactory()
        const image = mediaFactory({ entityId: sale.id })
        vi.spyOn(server.sales, "retrieveBiggest").mockResolvedValue({
            sales: [sale],
            images: [image],
        })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useBiggestQuery(5), { wrapper })

        await waitFor(() => expect(result.current.data?.sales).toEqual([sale]))
        expect(result.current.data?.images[sale.id]).toEqual(image)
        expect(server.sales.retrieveBiggest).toHaveBeenCalledWith({
            limit: 5,
        })
    })
})

describe("useAdminSearchQuery intimacy: medium", () => {
    it("functionality flattens the first page of sales", async () => {
        const sales = [saleAnalyticsFactory(), saleAnalyticsFactory({ id: 2 })]
        vi.spyOn(server.sales, "adminSearch").mockResolvedValue({
            sales,
            hasMore: false,
        })
        const { wrapper } = createWrapper()
        const searchParams: AdminSearchParams = {
            activation: ["active"],
            isAscending: true,
            sort: "startAt",
            search: "sale",
        }

        const { result } = renderHook(
            () => useAdminSearchQuery(10, searchParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.sales).toEqual(sales))
        expect(server.sales.adminSearch).toHaveBeenCalledWith({
            searchParams,
            limit: 10,
            offset: 0,
        })
    })
})

describe("usePostMutation intimacy: medium", () => {
    it("functionality posts a sale and invalidates admin sales", async () => {
        const sale = saleFactory()
        const { id: _id, ...saleInput } = sale
        const create = vi.spyOn(server.sale, "create")
            .mockResolvedValue(undefined)
        const { client, wrapper } = createWrapper()
        const invalidate = vi.spyOn(client, "invalidateQueries")
        const { result } = renderHook(() => usePostMutation(), { wrapper })

        await result.current.mutateAsync(saleInput)

        expect(create).toHaveBeenCalledWith(saleInput)
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sales"],
        })
    })
})

describe("usePatchMutation intimacy: medium", () => {
    it("functionality patches a sale and invalidates its queries", async () => {
        const patch = vi.spyOn(server.sale, "patch")
            .mockResolvedValue(undefined)
        const { client, wrapper } = createWrapper()
        const invalidate = vi.spyOn(client, "invalidateQueries")
        const { result } = renderHook(() => usePatchMutation(7), { wrapper })

        await result.current.mutateAsync({ name: "Updated" })

        expect(patch).toHaveBeenCalledWith(7, { name: "Updated" })
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sale-analytics", 7],
        })
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sales"],
        })
    })
})

describe("usePatchManyMutation intimacy: medium", () => {
    it("functionality patches selected sales and invalidates lists", async () => {
        const request = {
            ids: [1, 2],
            startAt: new Date("2026-05-01"),
            endAt: null,
            discountPercent: 20,
        }
        const patch = vi.spyOn(server.sales, "patch")
            .mockResolvedValue(undefined)
        const { client, wrapper } = createWrapper()
        const invalidate = vi.spyOn(client, "invalidateQueries")
        const { result } = renderHook(() => usePatchManyMutation(), { wrapper })

        await result.current.mutateAsync(request)

        expect(patch).toHaveBeenCalledWith(request)
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sales"],
        })
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sale-analytics"],
        })
    })
})

describe("useDeleteMutation intimacy: medium", () => {
    it("functionality deletes a sale and calls its success callback", async () => {
        const remove = vi.spyOn(server.sale, "delete")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const { client, wrapper } = createWrapper()
        const invalidate = vi.spyOn(client, "invalidateQueries")
        const { result } = renderHook(
            () => useDeleteMutation({ saleId: 8, onSuccess }),
            { wrapper },
        )

        await result.current.mutateAsync()

        expect(remove).toHaveBeenCalledWith(8)
        expect(onSuccess).toHaveBeenCalledOnce()
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ["admin", "sales"],
        })
    })
})

describe("useImportMutation intimacy: medium", () => {
    it("functionality submits a file for import", async () => {
        const file = new File(["sale"], "sales.csv", { type: "text/csv" })
        const importSales = vi.spyOn(server.sales, "import")
            .mockResolvedValue({
                imported: 1,
                updated: 0,
                failed: 0,
                errors: [],
            })
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useImportMutation(), { wrapper })

        result.current.mutate(file)

        await waitFor(() => expect(importSales).toHaveBeenCalledWith({
            file,
        }))
    })
})

describe("useExportMutation intimacy: medium", () => {
    it("functionality returns the exported file", async () => {
        const file = new Blob(["csv"])
        const exportSales = vi.spyOn(server.sales, "export")
            .mockResolvedValue(file)
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useExportMutation(), { wrapper })

        await expect(result.current.mutateAsync()).resolves.toBe(file)
        expect(exportSales).toHaveBeenCalledOnce()
    })
})