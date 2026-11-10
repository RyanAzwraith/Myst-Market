import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { itemSummaryFactory } from "../../../mock_data/item"
import { orderFactory, orderSummaryFactory } from "../../../mock_data/order"
import { userFactory } from "../../../mock_data/user"
import { ServerException, server } from "@/core"
import {
    useAdminSearchParams,
    useAdminSelectEdit,
    useCheckoutFormFields,
    useStatusForm,
} from "@/features/order/hook"

function setCheckoutValues(
    bindings: ReturnType<typeof useCheckoutFormFields>["bindings"],
) {
    bindings.name.set("Customer")
    bindings.email.set("customer@example.com")
    bindings.country_code.set("AU")
    bindings.postcode.set("3000")
    bindings.state.set("VIC")
    bindings.city.set("Melbourne")
    bindings.street.set("Main Street")
    bindings.deliveryNotes.set("Leave at the door")
    bindings.isCreatingAccount.set(false)
}

describe("useCheckoutFormFields intimacy: high", () => {
    it("functionality initializes customer details and checkout fields",
        () => {
            const user = userFactory({
                name: "Current Customer",
                email: "current@example.com",
            })
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useCheckoutFormFields({
                    items: [itemSummaryFactory({ productId: 3 })],
                    user,
                }),
                { wrapper },
            )

            expect(result.current.values).toMatchObject({
                name: "Current Customer",
                email: "current@example.com",
                isCreatingAccount: false,
            })
            expect(result.current.bindings.country_code.placeholder)
                .toBe("country code")
            expect(result.current.bindings.deliveryNotes.placeholder)
                .toBe("delivery note")
        },
    )

    it("submits checkout details and item summaries", async () => {
        const items = [itemSummaryFactory({
            productId: 3,
            quantity: 2,
        })]
        const create = vi.spyOn(server.order, "create")
            .mockReturnValue(new Promise(() => {}))
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCheckoutFormFields({ items }),
            { wrapper },
        )

        act(() => setCheckoutValues(result.current.bindings))
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(create).toHaveBeenCalledWith({
            items,
            address: {
                countryCode: "AU",
                postcode: "3000",
                state: "VIC",
                city: "Melbourne",
                street: "Main Street",
            },
            deliveryNote: "Leave at the door",
            user: {
                name: "Customer",
                email: "customer@example.com",
            },
            isCreatingAccount: false,
        }))
    })

    it("rejects checkout submission when cart items are missing", () => {
        const create = vi.spyOn(server.order, "create")
            .mockResolvedValue({ stripeSessionUrl: "/checkout" })
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCheckoutFormFields({ items: null }),
            { wrapper },
        )

        act(() => setCheckoutValues(result.current.bindings))
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg).toBe("Missing Cart Items")
        expect(create).not.toHaveBeenCalled()
    })

    it("shows server validation errors from checkout creation", async () => {
        const error = new ServerException({ message: "Invalid address" })
        vi.spyOn(server.order, "create").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCheckoutFormFields({
                items: [itemSummaryFactory()],
            }),
            { wrapper },
        )

        act(() => setCheckoutValues(result.current.bindings))
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        await waitFor(() => expect(result.current.errorMsg)
            .toBe("Invalid address"))
    })
})

describe("useAdminSearchParams intimacy: medium", () => {
    it("functionality parses order search parameters", () => {
        const { wrapper } = createWrapper(
            "/admin/orders?searchName=amulet&status=pending,shipped"
            + "&sort=cost&isAscending=true",
        )

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            searchName: "amulet",
            status: ["pending", "shipped"],
            sort: "cost",
            isAscending: true,
        })
    })

    it("uses empty filters and created-at sorting by default", () => {
        const { wrapper } = createWrapper("/admin/orders")

        const { result } = renderHook(() => useAdminSearchParams(), {
            wrapper,
        })

        expect(result.current.values()).toEqual({
            searchName: "",
            status: [],
            sort: "createdAt",
            isAscending: false,
        })
    })
})

describe("useAdminSelectEdit intimacy: high", () => {
    it("functionality patches the selected orders with a new status",
        async () => {
            const orders = [
                orderSummaryFactory({ id: 2 }),
                orderSummaryFactory({ id: 5 }),
            ]
            const patchStatus = vi.spyOn(server.orders, "patchStatus")
                .mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useAdminSelectEdit({ orders }),
                { wrapper },
            )

            act(() => {
                result.current.toggleSelect(2)
                result.current.toggleSelect(99)
                result.current.bindings.status.set("shipped")
            })
            act(() => result.current.submit())

            await waitFor(() => expect(patchStatus)
                .toHaveBeenCalledWith({
                    orderIds: [2],
                    status: "shipped",
                }))
            expect(result.current.selectedIds).toEqual(new Set([2]))
        },
    )

    it("toggles all valid order selections", () => {
        const orders = [
            orderSummaryFactory({ id: 2 }),
            orderSummaryFactory({ id: 5 }),
        ]
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useAdminSelectEdit({ orders }),
            { wrapper },
        )

        act(() => result.current.toggleSelectAll())
        expect(result.current.isAllSelected).toBe(true)
        act(() => result.current.toggleSelectAll())
        expect(result.current.selectedIds).toEqual(new Set())
    })
})

describe("useStatusForm intimacy: high", () => {
    it("functionality initializes from the order and submits a status",
        async () => {
            const order = orderFactory({
                id: 13,
                status: "processing",
            })
            const patchStatus = vi.spyOn(server.order, "patchStatus")
                .mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useStatusForm({ order }),
                { wrapper },
            )

            expect(result.current.values).toEqual({
                status: "processing",
            })
            act(() => result.current.bindings.status.set("shipped"))
            act(() => {
                result.current.handleSubmit({
                    preventDefault: vi.fn(),
                } as never)
            })

            await waitFor(() => expect(patchStatus)
                .toHaveBeenCalledWith(13, { status: "shipped" }))
        },
    )
})
