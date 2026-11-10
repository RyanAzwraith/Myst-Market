import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    PageRoutes,
    PageRoutesComponent,
    ProtectedRoute,
} from "@/app/PageRoutes"
import { userFactory } from "../../mock_data/user"
import { renderWithRouter, resetAuthState } from "../utils"

vi.mock("@/pages/catalogue", () => ({
    CataloguePage: () => <div>Catalogue page</div>,
}))

vi.mock("@/pages/shop", () => ({
    ShopPage: () => <div>Shop page</div>,
}))

vi.mock("@/pages/product", () => ({
    ProductPage: () => <div>Product page</div>,
}))

vi.mock("@/pages/sale", () => ({
    SalePage: () => <div>Sale page</div>,
}))

vi.mock("@/pages/checkout", () => ({
    CheckoutPage: () => <div>Checkout page</div>,
}))

vi.mock("@/pages/register", () => ({
    RegisterPage: () => <div>Register page</div>,
}))

vi.mock("@/pages/profile", () => ({
    ProfilePage: () => <div>Profile page</div>,
}))

vi.mock("@/pages/order", () => ({
    OrderPage: () => <div>Order page</div>,
}))

vi.mock("@/pages/login", () => ({
    LoginPage: () => <div>Login page</div>,
}))

vi.mock("@/pages/setPassword", () => ({
    SetPasswordPage: () => <div>Set password page</div>,
}))

vi.mock("@/pages/success", () => ({
    SuccessPage: () => <div>Success page</div>,
}))

vi.mock("@/pages/admin/dashboard", () => ({
    DashboardPage: () => <div>Dashboard page</div>,
}))

vi.mock("@/pages/admin/orders", () => ({
    OrdersPage: () => <div>Orders page</div>,
}))

vi.mock("@/pages/admin/products", () => ({
    ProductsPage: () => <div>Products page</div>,
}))

vi.mock("@/pages/admin/sales", () => ({
    SalesPage: () => <div>Sales page</div>,
}))

vi.mock("@/pages/admin/users", () => ({
    UsersPage: () => <div>Users page</div>,
}))

describe("PageRoutes intimacy: low", () => {
    it("functionality exposes the application route paths", () => {
        expect(PageRoutes.catalogue).toBe("/catalogue")
        expect(PageRoutes.shop).toBe("/shop")
        expect(PageRoutes.checkout).toBe("/checkout")
        expect(PageRoutes.admin).toBe("/admin")
        expect(PageRoutes.adminDashboard)
            .toBe("/admin/dashboard")
        expect(PageRoutes.adminOrders).toBe("/admin/orders")
    })

    it("builds parameterized product and sale paths", () => {
        expect(PageRoutes.product("moon-orb"))
            .toBe("/product/moon-orb")
        expect(PageRoutes.sale("winter-sale"))
            .toBe("/sale/winter-sale")
    })
})

describe("ProtectedRoute intimacy: low", () => {
    it("functionality redirects when access is not allowed", () => {
        renderWithRouter(
            <ProtectedRoute
            allowed={false}
            redirect="/login"
            child={<div>Private content</div>}
            />,
            {
                path: "*",
                initialPath: "/private",
            },
        )

        expect(screen.queryByText("Private content"))
            .not.toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/login")
    })

    it("renders the protected child when access is allowed", () => {
        renderWithRouter(
            <ProtectedRoute
            allowed={true}
            redirect="/login"
            child={<div>Private content</div>}
            />,
            {
                path: "*",
                initialPath: "/private",
            },
        )

        expect(screen.getByText("Private content"))
            .toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/private")
    })
})

describe("PageRoutesComponent intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders a public route", () => {
        renderWithRouter(<PageRoutesComponent />, {
            path: "*",
            initialPath: "/register",
        })

        expect(screen.getByText("Register page")).toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/register")
    })

    it("redirects signed-out users from their profile to login", () => {
        renderWithRouter(<PageRoutesComponent />, {
            path: "*",
            initialPath: "/profile",
        })

        expect(screen.getByText("Login page")).toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/login")
    })

    it("redirects signed-out users from admin pages", () => {
        renderWithRouter(<PageRoutesComponent />, {
            path: "*",
            initialPath: "/admin/dashboard",
        })

        expect(screen.getByText("Catalogue page"))
            .toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/catalogue")
    })

    it("redirects signed-in users from login to their profile", () => {
        resetAuthState({
            accessToken: "user-token",
            user: userFactory({ isAdmin: false }),
        })

        renderWithRouter(<PageRoutesComponent />, {
            path: "*",
            initialPath: "/login",
        })

        expect(screen.getByText("Profile page"))
            .toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/profile")
    })

    it("redirects the admin route to the admin dashboard", () => {
        resetAuthState({
            accessToken: "admin-token",
            user: userFactory({ isAdmin: true }),
        })

        renderWithRouter(<PageRoutesComponent />, {
            path: "*",
            initialPath: "/admin",
        })

        expect(screen.getByText("Dashboard page"))
            .toBeInTheDocument()
        expect(screen.getByTestId("location"))
            .toHaveTextContent("/admin/dashboard")
    })
})