import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { productAnalyticsFactory, productFactory } from "../../../mock_data/product"
import { server } from "@/core"
import {
    adminSelectEditFields,
    queryParamFields,
    updateFormFields,
    useAdminSearchParams,
    useAdminSelectEdit,
    useCreateFormFields,
    useSearchParams,
    useUpdateFormFields,
} from "@/features/product/hook"

describe("updateFormFields intimacy: low", () => {
    it("functionality defines product fields and initial values", () => {
        const product = productFactory({
            name: "Ancient Amulet",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2500,
            slug: "ancient-amulet",
            description: "An old magical amulet.",
            stock: 6,
        })

        const fields = updateFormFields(product)

        expect(fields.name.label).toBe("Name")
        expect(fields.name.initial).toBe(product.name)
        expect(fields.categoryName.initial)
            .toBe(product.categoryName)
        expect(fields.priceAudCent.initial)
            .toBe(product.priceAudCent)
        expect(fields.stock.initial).toBe(product.stock)
    })
})

describe("useCreateFormFields intimacy: medium", () => {
    it("functionality submits all product fields and calls onSuccess",
        async () => {
            const create = vi.spyOn(server.product, "create")
                .mockResolvedValue(undefined)
            const onSuccess = vi.fn()
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useCreateFormFields({ onSuccess }),
                { wrapper },
            )
            const values = {
                name: "New Product",
                categoryName: "artifacts",
                rarityName: "rare",
                priceAudCent: 1800,
                slug: "new-product",
                description: "A new product.",
                stock: 12,
            }

            act(() => {
                result.current.bindings.name.set(values.name)
                result.current.bindings.categoryName
                    .set(values.categoryName)
                result.current.bindings.rarityName.set(values.rarityName)
                result.current.bindings.priceAudCent
                    .set(values.priceAudCent)
                result.current.bindings.slug.set(values.slug)
                result.current.bindings.description
                    .set(values.description)
                result.current.bindings.stock.set(values.stock)
            })
            act(() => {
                result.current.handleSubmit({
                    preventDefault: vi.fn(),
                } as never)
            })

            await waitFor(() => expect(create).toHaveBeenCalledWith(values))
            expect(onSuccess).toHaveBeenCalledOnce()
        },
    )
})

describe("useUpdateFormFields intimacy: medium", () => {
    it("functionality initializes from and updates the product", async () => {
        const product = productFactory({
            id: 8,
            name: "Current Product",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2000,
            slug: "current-product",
            description: "Current description.",
            stock: 4,
        })
        const patch = vi.spyOn(server.product, "patch")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useUpdateFormFields({ product, onSuccess }),
            { wrapper },
        )

        expect(result.current.values).toEqual({
            name: product.name,
            categoryName: product.categoryName,
            rarityName: product.rarityName,
            priceAudCent: product.priceAudCent,
            slug: product.slug,
            description: product.description,
            stock: product.stock,
        })
        act(() => {
            result.current.bindings.name.set("Updated Product")
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(patch).toHaveBeenCalledWith(8, {
            name: "Updated Product",
            categoryName: product.categoryName,
            rarityName: product.rarityName,
            priceAudCent: product.priceAudCent,
            slug: product.slug,
            description: product.description,
            stock: product.stock,
        }))
        expect(onSuccess).toHaveBeenCalledOnce()
        expect(result.current.values.name).toBe("Updated Product")
    })
})

describe("useSearchParams intimacy: medium", () => {
    it("functionality parses product search parameters", () => {
        const { wrapper } = createWrapper(
            "/shop?categories=artifacts,potions&rarities=rare"
            + "&sort=price&isAscending=true&search=amulet",
        )

        const { result } = renderHook(() => useSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            categories: ["artifacts", "potions"],
            rarities: ["rare"],
            sort: "price",
            isAscending: true,
            search: "amulet",
        })
    })

    it("uses empty filters and popularity by default", () => {
        const { wrapper } = createWrapper("/shop")

        const { result } = renderHook(() => useSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            categories: [],
            rarities: [],
            sort: "popularity",
            isAscending: false,
            search: "",
        })
    })
})

describe("useAdminSearchParams intimacy: medium", () => {
    it("functionality parses admin product search parameters", () => {
        const { wrapper } = createWrapper(
            "/product?categories=artifacts&rarities=legendary"
            + "&sort=revenue&isDiscontinued=true&isAscending=true"
            + "&search=amulet",
        )

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            sort: "revenue",
            categories: ["artifacts"],
            rarities: ["legendary"],
            search: "amulet",
            isDiscontinued: true,
            isAscending: true,
        })
    })

    it("uses the newest sort and empty filters by default", () => {
        const { wrapper } = createWrapper("/product")

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            sort: "newest",
            categories: [],
            rarities: [],
            search: "",
            isDiscontinued: false,
            isAscending: false,
        })
    })
})

describe("useAdminSelectEdit intimacy: high", () => {
    it("functionality selects valid products and submits bulk values",
        async () => {
            const products = [
                productAnalyticsFactory({ id: 3 }),
                productAnalyticsFactory({ id: 5 }),
            ]
            const patch = vi.spyOn(server.products, "patch")
                .mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useAdminSelectEdit(products),
                { wrapper },
            )

            act(() => {
                result.current.toggleSelect(3)
                result.current.toggleSelect(99)
                result.current.bindings.categoryName.set("artifacts")
                result.current.bindings.rarityName.set("rare")
                result.current.bindings.priceAudCent.set(2400)
                result.current.bindings.stock.set(10)
            })
            expect(result.current.selectedIds).toEqual(new Set([3]))

            act(() => result.current.submit())

            await waitFor(() => expect(patch).toHaveBeenCalledWith({
                productIds: [3],
                categoryName: "artifacts",
                rarityName: "rare",
                priceAudCent: 2400,
                stock: 10,
            }))
        },
    )

    it("toggles all product ids", () => {
        const products = [
            productAnalyticsFactory({ id: 3 }),
            productAnalyticsFactory({ id: 5 }),
        ]
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useAdminSelectEdit(products),
            { wrapper },
        )

        act(() => result.current.toggleSelectAll())
        expect(result.current.isAllSelected).toBe(true)
        act(() => result.current.toggleSelectAll())
        expect(result.current.selectedIds).toEqual(new Set())
    })
})

describe("queryParamFields intimacy: low", () => {
    it("functionality defines customer search field options", () => {
        expect(queryParamFields.categories.options.artifacts)
            .toBe("artifacts")
        expect(queryParamFields.rarities.options.legendary)
            .toBe("legendary")
        expect(queryParamFields.sort.defaultValue).toBe("popularity")
        expect(queryParamFields.search.placeholder)
            .toBe("Search products...")
    })
})

describe("adminSelectEditFields intimacy: low", () => {
    it("functionality defines bulk edit fields", () => {
        expect(adminSelectEditFields.categoryName.label).toBe("Category")
        expect(adminSelectEditFields.rarityName.label).toBe("Rarity")
        expect(adminSelectEditFields.priceAudCent.label).toBe("Price")
        expect(adminSelectEditFields.stock.label).toBe("Stock")
    })
})
