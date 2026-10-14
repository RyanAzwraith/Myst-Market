import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { saleAnalyticsFactory } from "../../../mock_data/sale"
import { server } from "@/core"
import {
    useAdminSearchParams,
    useAdminSelectEdit,
    useCreateForm,
    useUpdateForm,
} from "@/features/sale/hook"

describe("useCreateForm intimacy: medium", () => {
    it("functionality provides empty sale fields and submits values", () => {
        const create = vi.spyOn(server.sale, "create")
            .mockResolvedValue(undefined)
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useCreateForm({}), { wrapper })

        expect(result.current.values).toMatchObject({
            name: null,
            slug: null,
            description: null,
            endAt: null,
            discountPerc: null,
        })
        expect(result.current.values.startAt).toEqual(expect.any(String))

        act(() => {
            result.current.bindings.name.set("New Sale")
            result.current.bindings.discountPerc.set(20)
        })
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        vi.waitFor(() => expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "New Sale",
                discountPerc: 20,
            }),
        ))
    })
})

describe("useUpdateForm intimacy: medium", () => {
    it("functionality initializes from the existing sale", () => {
        const sale = saleAnalyticsFactory({
            name: "Existing Sale",
            discountPerc: 30,
        })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useUpdateForm({
            sale,
        }), { wrapper })

        expect(result.current.values).toMatchObject({
            name: "Existing Sale",
            discountPerc: 30,
            slug: sale.slug,
        })
    })
})

describe("useAdminSearchParams intimacy: medium", () => {
    it("functionality exposes defaults and parses URL parameters", () => {
        const { wrapper } = createWrapper(
            "/admin/sales?search=amulet&activation=active,expired"
            + "&sort=revenue&isAscending=true",
        )

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            search: "amulet",
            activation: ["active", "expired"],
            sort: "revenue",
            isAscending: true,
        })
    })

    it("uses startAt and empty values by default", () => {
        const { wrapper } = createWrapper("/admin/sales")

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            search: "",
            activation: [],
            sort: "startAt",
            isAscending: false,
        })
    })
})

describe("useAdminSelectEdit intimacy: high", () => {
    it("functionality selects valid ids and submits bulk changes", () => {
        const patch = vi.spyOn(server.sales, "patch")
            .mockResolvedValue(undefined)
        const sales = [
            saleAnalyticsFactory({ id: 3 }),
            saleAnalyticsFactory({ id: 5 }),
        ]
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAdminSelectEdit(sales), {
            wrapper,
        })

        act(() => {
            result.current.toggleSelect(3)
            result.current.toggleSelect(99)
            result.current.bindings.startAt.set("2026-06-01")
            result.current.bindings.discountPercent.set(15)
        })
        expect(result.current.selectedIds).toEqual(new Set([3]))

        act(() => result.current.submit())

        vi.waitFor(() => expect(patch).toHaveBeenCalledWith({
            ids: [3],
            startAt: new Date("2026-06-01"),
            endAt: null,
            discountPercent: 15,
        }))
    })

    it("toggles all selected ids", () => {
        const sales = [
            saleAnalyticsFactory({ id: 3 }),
            saleAnalyticsFactory({ id: 5 }),
        ]
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useAdminSelectEdit(sales), {
            wrapper,
        })

        act(() => result.current.toggleSelectAll())
        expect(result.current.isAllSelected).toBe(true)
        act(() => result.current.toggleSelectAll())
        expect(result.current.selectedIds).toEqual(new Set())
    })
})