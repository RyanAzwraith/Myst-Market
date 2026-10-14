import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import {
    orderFactory,
    orderSummaryFactory,
} from "../../../mock_data/order"
import { userDetailFactory } from "../../../mock_data/user"
import { server } from "@/core"
import type { AdminSearchParams, Address } from "@/features/order/schema"
import {
    useAdminSearchQuery,
    useCreateMutation,
    useOrderQuery,
    usePatchManyStatusMutation,
    usePatchStatusMutation,
    useRecentQuery,
} from "@/features/order/service"

describe("useAdminSearchQuery intimacy: medium", () => {
    it("functionality flattens admin order search results", async () => {
        const orders = [
            orderSummaryFactory({ id: 1, status: "pending" }),
            orderSummaryFactory({ id: 2, status: "shipped" }),
        ]
        const searchParams: AdminSearchParams = {
            searchName: "customer",
            status: ["pending"],
            sort: "createdAt",
            isAscending: true,
        }
        const adminSearch = vi.spyOn(server.orders, "adminSearch")
            .mockResolvedValue({ orders, hasMore: false })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useAdminSearchQuery(10, searchParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.orders)
            .toEqual(orders))
        expect(adminSearch).toHaveBeenCalledWith({
            searchParams,
            limit: 10,
            offset: 0,
        })
    })

    it("fetches and appends the next order page", async () => {
        const firstPage = [orderSummaryFactory({ id: 3 })]
        const secondPage = [orderSummaryFactory({ id: 4 })]
        const adminSearch = vi.spyOn(server.orders, "adminSearch")
            .mockResolvedValueOnce({
                orders: firstPage,
                hasMore: true,
            })
            .mockResolvedValueOnce({
                orders: secondPage,
                hasMore: false,
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useAdminSearchQuery(1),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.orders)
            .toEqual(firstPage))
        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => expect(result.current.data?.orders)
            .toEqual([...firstPage, ...secondPage]))
        expect(adminSearch).toHaveBeenLastCalledWith({
            searchParams: null,
            limit: 1,
            offset: 1,
        })
    })
})

describe("useOrderQuery intimacy: medium", () => {
    it("functionality returns the requested order and user", async () => {
        const order = orderFactory({ id: 8 })
        const user = userDetailFactory({ id: order.userId })
        const getById = vi.spyOn(server.order, "getById")
            .mockResolvedValue({ order, user })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useOrderQuery(8), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data)
            .toEqual({ order, user }))
        expect(getById).toHaveBeenCalledWith(8)
    })

    it("does not request an order when the id is undefined", async () => {
        const getById = vi.spyOn(server.order, "getById")
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useOrderQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.fetchStatus)
            .toBe("idle"))
        expect(getById).not.toHaveBeenCalled()
    })
})

describe("useRecentQuery intimacy: medium", () => {
    it("functionality selects recent orders from the response", async () => {
        const orders = [
            orderFactory({ id: 5 }),
            orderFactory({ id: 6 }),
        ]
        const getRecent = vi.spyOn(server.orders, "getRecent")
            .mockResolvedValue({ orders })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useRecentQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(orders))
        expect(getRecent).toHaveBeenCalledOnce()
    })
})

describe("useCreateMutation intimacy: medium", () => {
    it("functionality sends checkout data to the server", async () => {
        const request = {
            items: [{ productId: 4, quantity: 2 }],
            address: {
                countryCode: "AU",
                postcode: "3000",
                state: "VIC",
                city: "Melbourne",
                street: "Main Street",
            } satisfies Address,
            deliveryNote: "Leave at the door",
            user: {
                name: "Customer",
                email: "customer@example.com",
            },
            isCreatingAccount: false,
        }
        const create = vi.spyOn(server.order, "create")
            .mockReturnValue(new Promise(() => {}))
        const { wrapper } = createWrapper()
        const { result } = renderHook(() => useCreateMutation(), {
            wrapper,
        })

        act(() => result.current.mutate(request))
        await waitFor(() => expect(create).toHaveBeenCalledWith(request))
    })
})

describe("usePatchStatusMutation intimacy: medium", () => {
    it("functionality patches an order and invalidates related queries",
        async () => {
            const patchStatus = vi.spyOn(server.order, "patchStatus")
                .mockResolvedValue(undefined)
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(
                () => usePatchStatusMutation(11),
                { wrapper },
            )

            await result.current.mutateAsync({ status: "shipped" })

            expect(patchStatus).toHaveBeenCalledWith(11, {
                status: "shipped",
            })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "orders"],
            })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "order", 11],
            })
        },
    )
})

describe("usePatchManyStatusMutation intimacy: medium", () => {
    it("functionality patches selected orders and invalidates lists",
        async () => {
            const patchStatus = vi.spyOn(server.orders, "patchStatus")
                .mockResolvedValue(undefined)
            const request = {
                orderIds: [2, 7],
                status: "cancelled" as const,
            }
            const { client, wrapper } = createWrapper()
            const invalidate = vi.spyOn(client, "invalidateQueries")
            const { result } = renderHook(
                () => usePatchManyStatusMutation(),
                { wrapper },
            )

            await result.current.mutateAsync(request)

            expect(patchStatus).toHaveBeenCalledWith(request)
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "orders"],
            })
            expect(invalidate).toHaveBeenCalledWith({
                queryKey: ["admin", "order"],
            })
        },
    )
})
