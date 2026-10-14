import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithRouter } from "../../../utils"
import { userAnalyticsFactory, userFactory } from "../../../../mock_data/user"
import {
    AdminSummaryInfo,
    AnalyticsInfo,
    UserInfo,
} from "@/features/user/components/content"

describe("UserInfo intimacy: low", () => {
    it("functionality renders the user's name and email", () => {
        const user = userFactory({
            name: "Customer Name",
            email: "customer@example.com",
        })

        renderWithRouter(<UserInfo user={user} />)

        expect(screen.getByText("Name: Customer Name")).toBeInTheDocument()
        expect(screen.getByText("Email: customer@example.com"))
            .toBeInTheDocument()
    })
})

describe("AdminSummaryInfo intimacy: low", () => {
    it("functionality renders registration and order summary", () => {
        const user = userAnalyticsFactory({
            name: "Admin Customer",
            email: "admin-customer@example.com",
            isRegistered: true,
            orderCount: 4,
            spent: 1250,
            reviewCount: 3,
        })

        renderWithRouter(<AdminSummaryInfo user={user} />)

        expect(screen.getByText("Admin Customer")).toBeInTheDocument()
        expect(screen.getByText("admin-customer@example.com"))
            .toBeInTheDocument()
        expect(screen.getByText(/Registered/))
            .toHaveTextContent("Registered · 4 orders")
        expect(screen.getByText("$ 1250.00")).toBeInTheDocument()
        expect(screen.getByText(/3 reviews/))
            .toHaveTextContent("3 reviews")
    })

    it("labels an unregistered user as a guest", () => {
        const user = userAnalyticsFactory({
            isRegistered: false,
            orderCount: 0,
            spent: 0,
            reviewCount: 0,
        })

        renderWithRouter(<AdminSummaryInfo user={user} />)

        expect(screen.getByText(/Guest/))
            .toHaveTextContent("Guest · 0 orders")
        expect(screen.getByText("$ 0.00")).toBeInTheDocument()
        expect(screen.getByText(/0 reviews/))
            .toHaveTextContent("0 reviews")
    })

})

describe("AnalyticsInfo intimacy: low", () => {
    it("functionality renders the complete analytics summary", () => {
        const user = userAnalyticsFactory({
            id: 9,
            name: "Analytics Customer",
            email: "analytics@example.com",
            isRegistered: true,
            createdAt: "2026-05-01",
            deletedAt: null,
            orderCount: 6,
            spent: 2400,
            revenueLost: 120,
            reviewCount: 5,
        })

        renderWithRouter(<AnalyticsInfo user={user} />)

        expect(screen.getByText("ID: 9")).toBeInTheDocument()
        expect(screen.getByText("Name: Analytics Customer"))
            .toBeInTheDocument()
        expect(screen.getByText("Email: analytics@example.com"))
            .toBeInTheDocument()
        expect(screen.getByText("Registration: Registered"))
            .toBeInTheDocument()
        expect(screen.getByText("Created at: 2026-05-01"))
            .toBeInTheDocument()
        expect(screen.getByText("Deleted at: No")).toBeInTheDocument()
        expect(screen.getByText("Order Count: 6")).toBeInTheDocument()
        expect(screen.getByText(/Spent:/))
            .toHaveTextContent("Spent: $ 2400.00")
        expect(screen.getByText(/Revenue lost:/))
            .toHaveTextContent("Revenue lost: $ 120.00")
        expect(screen.getByText("Reviews: 5")).toBeInTheDocument()
    })
})
