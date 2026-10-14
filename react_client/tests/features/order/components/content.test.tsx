import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { itemResolutionFactory } from "../../../../mock_data/item"
import { orderFactory, orderSummaryFactory } from "../../../../mock_data/order"
import { userDetailFactory } from "../../../../mock_data/user"
import {
    AdminInfo,
    AdminPerformanceInfo,
    AdminSummaryInfo,
    OrderInfo,
    OrderSummaryInfo,
} from "@/features/order/components/content"

describe("OrderSummaryInfo intimacy: low", () => {
    it("functionality renders the order date and total", () => {
        const order = orderSummaryFactory({
            createdAt: "2026-04-01",
            totalCent: 2450,
        })

        renderWithRouter(<OrderSummaryInfo order={order} />)

        expect(screen.getByText("2026-04-01")).toBeInTheDocument()
        expect(screen.getByText(/total/))
            .toHaveTextContent("$ 2450.00 total")
    })
})

describe("OrderInfo intimacy: low", () => {
    it("functionality renders delivery details and order cost", () => {
        const order = orderFactory({
            addressString: "1 Main Street, Melbourne",
            createdAt: "2026-04-02",
            costAudCent: 3600,
        })

        renderWithRouter(<OrderInfo order={order} />)

        expect(screen.getByText(/Delivery address:/))
            .toHaveTextContent("Delivery address: 1 Main Street, Melbourne")
        expect(screen.getByText("Placed 2026-04-02"))
            .toBeInTheDocument()
        expect(screen.getByText(/Total:/))
            .toHaveTextContent("Total: $ 3600.00")
    })
})

describe("AdminSummaryInfo intimacy: low", () => {
    it("functionality renders order identity, status, and total", () => {
        const order = orderSummaryFactory({
            id: 7,
            status: "processing",
            totalCent: 4800,
        })

        renderWithRouter(<AdminSummaryInfo order={order} />)

        expect(screen.getByText("Order #7")).toBeInTheDocument()
        expect(screen.getByText("processing")).toBeInTheDocument()
        expect(screen.getByText("$ 4800.00")).toBeInTheDocument()
    })
})

describe("AdminInfo intimacy: medium", () => {
    it("functionality renders order and registered-user information", () => {
        const order = orderFactory({
            userId: 9,
            addressString: "1 Main Street, Melbourne",
            costAudCent: 5200,
            items: [
                itemResolutionFactory(),
                itemResolutionFactory({ product: {
                    id: 2,
                    saleID: null,
                    name: "Second Product",
                    slug: "second-product",
                } }),
            ],
        })
        const user = userDetailFactory({
            id: 9,
            name: "Registered Customer",
            email: "registered@example.com",
            isRegistered: true,
        })

        renderWithRouter(<AdminInfo order={order} user={user} />)

        expect(screen.getByText(/Total:/))
            .toHaveTextContent("Total: $ 5200.00")
        expect(screen.getByText("Items: 2")).toBeInTheDocument()
        expect(screen.getByText("Address: 1 Main Street, Melbourne"))
            .toBeInTheDocument()
        expect(screen.getByText("User ID: 9")).toBeInTheDocument()
        expect(screen.getByText("User: Registered Customer"))
            .toBeInTheDocument()
        expect(screen.getByText("Email: registered@example.com"))
            .toBeInTheDocument()
        expect(screen.getByText("Account: Registered"))
            .toBeInTheDocument()
    })

    it("labels an unregistered user as a guest", () => {
        const order = orderFactory({
            items: [],
            userId: 10,
        })
        const user = userDetailFactory({
            id: 10,
            isRegistered: false,
        })

        renderWithRouter(<AdminInfo order={order} user={user} />)

        expect(screen.getByText("Items: 0")).toBeInTheDocument()
        expect(screen.getByText("Account: Guest")).toBeInTheDocument()
    })
})

describe("AdminPerformanceInfo intimacy: low", () => {
    it("functionality renders order cost and status", () => {
        const order = orderFactory({
            costAudCent: 2750,
            status: "delivered",
        })

        renderWithRouter(<AdminPerformanceInfo order={order} />)

        expect(screen.getByText("$ 2750.00")).toBeInTheDocument()
        expect(screen.getByText("delivered")).toBeInTheDocument()
    })
})
