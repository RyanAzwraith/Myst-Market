import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { orderFactory, orderSummaryFactory } from "../../../../mock_data/order"
import { userDetailFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    AdminSearchLoader,
    CheckoutLoader,
    OrderLoader,
    RecentLoader,
} from "@/features/order/components/loader"

describe("OrderLoader intimacy: medium", () => {
    it("functionality passes the loaded order and user to render",
        async () => {
            const order = orderFactory({ id: 8 })
            const user = userDetailFactory({ id: order.userId })
            const getById = vi.spyOn(server.order, "getById")
                .mockResolvedValue({ order, user })
            const renderOrder = vi.fn(({ order: loadedOrder }) => (
                <p>{loadedOrder.id}</p>
            ))

            renderWithRouter(
                <OrderLoader orderId={8} render={renderOrder} />,
            )

            expect(await screen.findByText("8")).toBeInTheDocument()
            expect(getById).toHaveBeenCalledWith(8)
            expect(renderOrder).toHaveBeenCalledWith({ order, user })
        },
    )

    it("shows loading while the order is unavailable", () => {
        vi.spyOn(server.order, "getById").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <OrderLoader orderId={8} render={vi.fn()} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("RecentLoader intimacy: medium", () => {
    it("functionality passes recent orders to render", async () => {
        const orders = [orderFactory({ id: 4 })]
        const getRecent = vi.spyOn(server.orders, "getRecent")
            .mockResolvedValue({ orders })
        const renderOrders = vi.fn(({ orders: loadedOrders }) => (
            <p>{loadedOrders[0].id}</p>
        ))

        renderWithRouter(<RecentLoader render={renderOrders} />)

        expect(await screen.findByText("4")).toBeInTheDocument()
        expect(getRecent).toHaveBeenCalledOnce()
        expect(renderOrders).toHaveBeenCalledWith({ orders })
    })

    it("shows loading while recent orders are unavailable", () => {
        vi.spyOn(server.orders, "getRecent").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(<RecentLoader render={vi.fn()} />)

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("AdminSearchLoader intimacy: high", () => {
    it("functionality passes searched orders and selection controls",
        async () => {
            const orders = [orderSummaryFactory({ id: 12 })]
            const adminSearch = vi.spyOn(server.orders, "adminSearch")
                .mockResolvedValue({ orders, hasMore: false })
            const renderOrders = vi.fn(({ orders: loadedOrders }) => (
                <p>{loadedOrders[0]?.id ?? "empty"}</p>
            ))

            renderWithRouter(
                <AdminSearchLoader render={renderOrders} limit={5} />,
                { initialPath: "/admin/orders" },
            )

            expect(await screen.findByText("12")).toBeInTheDocument()
            expect(adminSearch).toHaveBeenCalledWith({
                searchParams: {
                    searchName: "",
                    status: [],
                    sort: "createdAt",
                    isAscending: false,
                },
                limit: 5,
                offset: 0,
            })
            expect(renderOrders).toHaveBeenCalledWith(
                expect.objectContaining({ orders }),
            )
        },
    )

    it("passes an empty order list while search is pending", () => {
        vi.spyOn(server.orders, "adminSearch").mockReturnValue(
            new Promise(() => {}),
        )
        const renderOrders = vi.fn(({ orders }) => (
            <p>{orders.length} orders</p>
        ))

        renderWithRouter(
            <AdminSearchLoader render={renderOrders} />,
            { initialPath: "/admin/orders" },
        )

        expect(screen.getByText("0 orders")).toBeInTheDocument()
    })
})

describe("CheckoutLoader intimacy: high", () => {
    it("functionality provides an empty checkout form and no items", () => {
        const renderCheckout = vi.fn(({ items, form }) => (
            <p>
                {items === null ? "No items" : items.length}
                {form.bindings.name.label}
            </p>
        ))

        renderWithRouter(<CheckoutLoader render={renderCheckout} />)

        expect(screen.getByText("No itemsName")).toBeInTheDocument()
        expect(renderCheckout).toHaveBeenCalledWith(
            expect.objectContaining({ items: null }),
        )
    })

    it("updates items through the provided setter", async () => {
        const summary = { productId: 4, quantity: 2 }
        const renderCheckout = vi.fn(({ items, setItems }) => (
            <div>
                <p>{items ? items[0].productId : "empty"}</p>
                <button
                    type="button"
                    onClick={() => setItems([summary])}
                >
                    Set items
                </button>
            </div>
        ))
        const user = userEvent.setup()

        renderWithRouter(<CheckoutLoader render={renderCheckout} />)
        await user.click(screen.getByRole("button", { name: "Set items" }))

        expect(screen.getByText("4")).toBeInTheDocument()
    })
})
