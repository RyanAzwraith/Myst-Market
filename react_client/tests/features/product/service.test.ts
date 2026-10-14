import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { mediaFactory } from "../../../mock_data/media"
import { productAnalyticsFactory, productFactory } from "../../../mock_data/product"
import { reviewFactory } from "../../../mock_data/review"
import { server } from "@/core"
import type {
    AdminSearchParams,
    SearchParams,
} from "@/features/product/schema"
import {
    useAdminSearchQuery,
    useAnalyticsQuery,
    useDeleteMutation,
    useExportMutation,
    useFeaturedQuery,
    useImageQuery,
    useImportMutation,
    useMediasQuery,
    useNewestQuery,
    usePatchManyMutation,
    usePatchMutation,
    usePopularQuery,
    usePostMutation,
    useProductQuery,
    useReviewsQuery,
    useSearchQuery,
    useTopQuery,
} from "@/features/product/service"

describe("useSearchQuery intimacy: medium", () => {
    it("functionality flattens products and indexes page images", async () => {
        const products = [
            productFactory({ id: 1 }),
            productFactory({ id: 2 }),
        ]
        const images = [
            mediaFactory({ entityId: 1 }),
            mediaFactory({ entityId: 2 }),
        ]
        const searchParams: SearchParams = {
            categories: ["artifacts"],
            rarities: ["rare"],
            sort: "popularity",
            isAscending: false,
            search: "amulet",
        }
        const search = vi.spyOn(server.products, "search")
            .mockResolvedValue({
                products,
                images,
                hasMore: false,
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useSearchQuery(10, searchParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.products)
            .toEqual(products))
        expect(result.current.data?.images[1]).toEqual(images[0])
        expect(search).toHaveBeenCalledWith({
            searchParams,
            limit: 10,
            offset: 0,
        })
    })

    it("fetches and appends the next product page", async () => {
        const firstProduct = productFactory({ id: 1 })
        const secondProduct = productFactory({ id: 2 })
        const search = vi.spyOn(server.products, "search")
            .mockResolvedValueOnce({
                products: [firstProduct],
                images: [mediaFactory({ entityId: 1 })],
                hasMore: true,
            })
            .mockResolvedValueOnce({
                products: [secondProduct],
                images: [mediaFactory({ entityId: 2 })],
                hasMore: false,
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useSearchQuery(1), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([firstProduct]))
        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([firstProduct, secondProduct]))
        expect(search).toHaveBeenLastCalledWith({
            searchParams: null,
            limit: 1,
            offset: 1,
        })
    })
})

describe("useAdminSearchQuery intimacy: medium", () => {
    it("functionality flattens the returned analytics products", async () => {
        const products = [
            productAnalyticsFactory({ id: 1 }),
            productAnalyticsFactory({ id: 2 }),
        ]
        const searchParams: AdminSearchParams = {
            sort: "revenue",
            categories: ["artifacts"],
            rarities: ["rare"],
            search: "amulet",
            isDiscontinued: false,
            isAscending: true,
        }
        const adminSearch = vi.spyOn(server.products, "adminSearch")
            .mockResolvedValue({ products, hasMore: false })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useAdminSearchQuery(20, searchParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.products)
            .toEqual(products))
        expect(adminSearch).toHaveBeenCalledWith({
            searchParams,
            limit: 20,
            offset: 0,
        })
    })
})

describe("useProductQuery intimacy: medium", () => {
    it("functionality selects the product returned for a slug", async () => {
        const product = productFactory({ slug: "ancient-amulet" })
        const getBySlug = vi.spyOn(server.product, "getBySlug")
            .mockResolvedValue({ product })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useProductQuery(product.slug),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data).toEqual(product))
        expect(getBySlug).toHaveBeenCalledWith(product.slug)
    })

    it("does not request a product when the slug is undefined", async () => {
        const getBySlug = vi.spyOn(server.product, "getBySlug")
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useProductQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.fetchStatus)
            .toBe("idle"))
        expect(getBySlug).not.toHaveBeenCalled()
    })
})

describe("useImageQuery intimacy: medium", () => {
    it("functionality selects the product image", async () => {
        const media = mediaFactory({ entityId: 4 })
        const getImage = vi.spyOn(server.product, "getImage")
            .mockResolvedValue({ media })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useImageQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(media))
        expect(getImage).toHaveBeenCalledWith(4)
    })
})

describe("useMediasQuery intimacy: medium", () => {
    it("functionality selects all product media", async () => {
        const medias = [
            mediaFactory({ id: 1, entityId: 4 }),
            mediaFactory({ id: 2, entityId: 4 }),
        ]
        const getMedias = vi.spyOn(server.product, "getMedias")
            .mockResolvedValue({ medias })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useMediasQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(medias))
        expect(getMedias).toHaveBeenCalledWith(4)
    })
})

describe("useAnalyticsQuery intimacy: medium", () => {
    it("functionality selects product analytics", async () => {
        const product = productAnalyticsFactory({ id: 4 })
        const getAnalytics = vi.spyOn(server.product, "getAnalytics")
            .mockResolvedValue({ product })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAnalyticsQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(product))
        expect(getAnalytics).toHaveBeenCalledWith(4)
    })
})

describe("useReviewsQuery intimacy: medium", () => {
    it("functionality returns reviews and review metadata", async () => {
        const response = {
            reviews: [reviewFactory({ id: 1 })],
            average: 4.5,
            userHasReview: false,
        }
        const getReviews = vi.spyOn(server.product, "getReviews")
            .mockResolvedValue(response)
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useReviewsQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(response))
        expect(getReviews).toHaveBeenCalledWith(4)
    })
})

describe("useFeaturedQuery intimacy: medium", () => {
    it("functionality selects products and indexes images", async () => {
        const product = productFactory({ id: 4 })
        const image = mediaFactory({ entityId: 4 })
        const retrieve = vi.spyOn(server.products, "retrieveFeatured")
            .mockResolvedValue({
                products: [product],
                images: [image],
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useFeaturedQuery(3), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([product]))
        expect(result.current.data?.images[4]).toEqual(image)
        expect(retrieve).toHaveBeenCalledWith({ limit: 3 })
    })
})

describe("usePopularQuery intimacy: medium", () => {
    it("functionality selects popular products and images", async () => {
        const product = productFactory({ id: 5 })
        const image = mediaFactory({ entityId: 5 })
        const retrieve = vi.spyOn(server.products, "retrievePopular")
            .mockResolvedValue({
                products: [product],
                images: [image],
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => usePopularQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([product]))
        expect(result.current.data?.images[5]).toEqual(image)
        expect(retrieve).toHaveBeenCalledWith({ limit: 4 })
    })
})

describe("useNewestQuery intimacy: medium", () => {
    it("functionality selects newest products and images", async () => {
        const product = productFactory({ id: 6 })
        const image = mediaFactory({ entityId: 6 })
        const retrieve = vi.spyOn(server.products, "retrieveNewest")
            .mockResolvedValue({
                products: [product],
                images: [image],
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useNewestQuery(4), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([product]))
        expect(result.current.data?.images[6]).toEqual(image)
        expect(retrieve).toHaveBeenCalledWith({ limit: 4 })
    })
})

describe("useTopQuery intimacy: medium", () => {
    it("functionality selects top products and images", async () => {
        const product = productAnalyticsFactory({ id: 7 })
        const image = mediaFactory({ entityId: 7 })
        const retrieve = vi.spyOn(
            server.products,
            "retrieveMostSoldProducts",
        ).mockResolvedValue({
            products: [product],
            images: [image],
        })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useTopQuery(5), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data?.products)
            .toEqual([product]))
        expect(result.current.data?.images[7]).toEqual(image)
        expect(retrieve).toHaveBeenCalledWith({ limit: 5 })
    })
})

describe("usePostMutation intimacy: medium", () => {
    it("functionality creates a product and invalidates admin products",
        async () => {
            const input = {
                name: "New Product",
                categoryName: "artifacts",
                rarityName: "rare",
                priceAudCent: 1500,
                slug: "new-product",
                description: "A new product",
                stock: 8,
            }
            const create = vi.spyOn(server.product, "create")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(() => usePostMutation(), {
                wrapper,
            })

            await result.current.mutateAsync(input)

            expect(create).toHaveBeenCalledWith(input)
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "products"],
            })
        },
    )
})

describe("usePatchMutation intimacy: medium", () => {
    it("functionality patches a product and invalidates related queries",
        async () => {
            const patch = vi.spyOn(server.product, "patch")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(() => usePatchMutation(4), {
                wrapper,
            })
            const input = { name: "Updated Product" }

            await result.current.mutateAsync(input)

            expect(patch).toHaveBeenCalledWith(4, input)
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "product-analytics", 4],
            })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "products"],
            })
        },
    )
})

describe("useDeleteMutation intimacy: medium", () => {
    it("functionality deletes a product and invalidates product lists",
        async () => {
            const remove = vi.spyOn(server.product, "delete")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(() => useDeleteMutation(), {
                wrapper,
            })

            await result.current.mutateAsync(4)

            expect(remove).toHaveBeenCalledWith(4)
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "products"],
            })
        },
    )
})

describe("usePatchManyMutation intimacy: medium", () => {
    it("functionality patches selected products and invalidates lists",
        async () => {
            const input = {
                productIds: [1, 2],
                categoryName: "artifacts",
                rarityName: "rare",
                priceAudCent: 2500,
                stock: 10,
            }
            const patch = vi.spyOn(server.products, "patch")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(
                () => usePatchManyMutation(),
                { wrapper },
            )

            await result.current.mutateAsync(input)

            expect(patch).toHaveBeenCalledWith(input)
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "products"],
            })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "productAnalytics"],
            })
        },
    )
})

describe("useImportMutation intimacy: medium", () => {
    it("functionality imports a product file and invalidates products",
        async () => {
            const file = new File(["product"], "products.csv", {
                type: "text/csv",
            })
            const importProducts = vi.spyOn(server.products, "import")
                .mockResolvedValue({
                    imported: 1,
                    updated: 0,
                    failed: 0,
                    errors: [],
                })
                const { client, wrapper } = createWrapper()
                const invalidate = vi.spyOn(client, "invalidateQueries")
                const { result } = renderHook(() => useImportMutation(), {
                    wrapper,
                })

            await result.current.mutateAsync(file)

            expect(importProducts).toHaveBeenCalledWith({ file })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["products"],
            })
        },
    )
})

describe("useExportMutation intimacy: medium", () => {
    it("functionality returns the exported product file", async () => {
        const file = new Blob(["products"])
        const exportProducts = vi.spyOn(server.products, "export")
            .mockResolvedValue(file)
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useExportMutation(), {
            wrapper,
        })

        await expect(result.current.mutateAsync()).resolves.toBe(file)
        expect(exportProducts).toHaveBeenCalledOnce()
    })
})
