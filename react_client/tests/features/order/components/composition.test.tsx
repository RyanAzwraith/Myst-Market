import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { itemResolutionFactory } from "../../../../mock_data/item"
import { orderFactory, orderSummaryFactory } from "../../../../mock_data/order"
import { userDetailFactory } from "../../../../mock_data/user"
import { server } from "@/core"
import {
    OrderCard,
    OrderRow,
} from "@/features/order/components/composition"

describe("OrderCard intimacy: medium", () => {
    it("functionality renders an order summary card", () => {
        const order = orderSummaryFactory({
            id: 4,
            createdAt: "2026-04-01",
            totalCent: 2500,
        })

        renderWithRouter(<OrderCard order={order} />)

        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.getByText("2026-04-01")).toBeInTheDocument()
        expect(screen.getByText(/total/))
            .toHaveTextContent("$ 2500.00 total")
    })

    it("calls onClick when an order card is selected", async () => {
        const order = orderSummaryFactory({ id: 5 })
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(<OrderCard order={order} onClick={onClick} />)
        await user.click(screen.getByRole("article"))

        expect(onClick).toHaveBeenCalledOnce()
    })
})

describe("OrderRow intimacy: high", () => {
    beforeEach(() => {
        vi.spyOn(server.product, "getImage").mockReturnValue(
            new Promise(() => {}),
        )
    })

    it("functionality opens an order detail modal", async () => {
        const summary = orderSummaryFactory({
            id: 22,
            status: "processing",
        })
        const order = orderFactory({
            id: 22,
            status: "processing",
            items: [itemResolutionFactory()],
        })
        const user = userDetailFactory({ id: order.userId })
        const getById = vi.spyOn(server.order, "getById")
            .mockResolvedValue({ order, user })
        const userActions = userEvent.setup()

        renderWithRouter(<OrderRow order={summary} />)
        await userActions.click(screen.getByRole("button", {
            name: /Order #22/,
        }))

        expect(await screen.findByRole("heading", {
            name: "Order Details",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Items" }))
            .toBeInTheDocument()
        expect(screen.getByLabelText("Order status"))
            .toBeInTheDocument()
        expect(getById).toHaveBeenCalledWith(22)
    })

    it("shows loading while order details are unavailable", async () => {
        const summary = orderSummaryFactory({ id: 23 })
        vi.spyOn(server.order, "getById").mockReturnValue(
            new Promise(() => {}),
        )
        const user = userEvent.setup()

        renderWithRouter(<OrderRow order={summary} />)
        await user.click(screen.getByRole("button", {
            name: /Order #23/,
        }))

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
