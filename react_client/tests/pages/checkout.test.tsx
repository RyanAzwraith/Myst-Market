import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    renderWithRouter,
    resetAuthState,
    resetCartState,
} from "../utils"
import { mockAccessToken } from "../../mock_data/auth"
import { itemResolutionFactory } from "../../mock_data/item"
import { productFactory } from "../../mock_data/product"
import { userFactory } from "../../mock_data/user"
import { server } from "@/core"
import { useAuthState } from "@/features/auth/state"
import { CheckoutPage } from "@/pages/checkout"

describe("CheckoutPage intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
        resetCartState([])
    })

    it("functionality renders guest checkout sections and fields", async () => {
        vi.spyOn(server.items, "resolve").mockResolvedValue({
            items: [],
            totalCent: 0,
        })

        renderWithRouter(<CheckoutPage />, {
            path: "/checkout",
            initialPath: "/checkout",
        })

        expect(screen.getByRole("heading", { name: "Checkout" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Account Information",
        })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Cart" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Delivery Information",
        })).toBeInTheDocument()
        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByLabelText(
            "Would you like to create an account?",
        )).toBeInTheDocument()
        expect(screen.getByPlaceholderText("country code"))
            .toBeInTheDocument()
        expect(screen.getByPlaceholderText("postcode"))
            .toBeInTheDocument()
        expect(screen.getByPlaceholderText("state")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("city")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("street")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("delivery note"))
            .toBeInTheDocument()
        expect(await screen.findByText(/Total/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Pay with Stripe" }))
            .toBeInTheDocument()
    })

    it("shows authenticated account information instead of guest fields",
        async () => {
            const account = userFactory({
                name: "Registered Adventurer",
                email: "registered@example.com",
            })
            useAuthState.getState().login(mockAccessToken, account)
            vi.spyOn(server.items, "resolve").mockResolvedValue({
                items: [],
                totalCent: 0,
            })

            renderWithRouter(<CheckoutPage />, {
                path: "/checkout",
                initialPath: "/checkout",
            })

            expect(await screen.findByText(
                "Name: Registered Adventurer",
            )).toBeInTheDocument()
            expect(screen.getByText(
                "Email: registered@example.com",
            )).toBeInTheDocument()
            expect(screen.queryByLabelText("Name"))
                .not.toBeInTheDocument()
            expect(screen.queryByLabelText("Email"))
                .not.toBeInTheDocument()
            expect(screen.queryByLabelText(
                "Would you like to create an account?",
            )).not.toBeInTheDocument()
        },
    )

    it("requires cart items before submitting payment", async () => {
        vi.spyOn(server.items, "resolve").mockReturnValue(
            new Promise(() => {}),
        )
        const create = vi.spyOn(server.order, "create")
            .mockReturnValue(new Promise(() => {}))
        const user = userEvent.setup()

        renderWithRouter(<CheckoutPage />, {
            path: "/checkout",
            initialPath: "/checkout",
        })

        await user.type(
            screen.getByLabelText("Name"),
            "Guest Adventurer",
        )
        await user.type(
            screen.getByLabelText("Email"),
            "guest@example.com",
        )
        await user.type(
            screen.getByPlaceholderText("country code"),
            "AU",
        )
        await user.type(screen.getByPlaceholderText("postcode"), "3000")
        await user.type(screen.getByPlaceholderText("state"), "Victoria")
        await user.type(screen.getByPlaceholderText("city"), "Melbourne")
        await user.type(
            screen.getByPlaceholderText("street"),
            "1 Main Street",
        )
        await user.click(screen.getByRole("button", {
            name: "Pay with Stripe",
        }))

        expect(await screen.findByText("Missing Cart Items"))
            .toBeInTheDocument()
        expect(create).not.toHaveBeenCalled()
    })

    it("submits resolved cart and delivery details to the order server",
        async () => {
            const product = productFactory({
                id: 55,
                name: "Checkout Relic",
            })
            const resolvedItem = itemResolutionFactory({
                product: {
                    id: product.id,
                    saleID: null,
                    name: product.name,
                    slug: product.slug,
                },
                quantity: 2,
                unitPriceCent: 900,
                lineTotalCent: 1800,
            })
            resetCartState([product])
            vi.spyOn(server.items, "resolve").mockResolvedValue({
                items: [resolvedItem],
                totalCent: 1800,
            })
            const create = vi.spyOn(server.order, "create")
                .mockReturnValue(new Promise(() => {}))
            const user = userEvent.setup()

            renderWithRouter(<CheckoutPage />, {
                path: "/checkout",
                initialPath: "/checkout",
            })

            expect(await screen.findByText("Checkout Relic"))
                .toBeInTheDocument()
            await user.type(
                screen.getByLabelText("Name"),
                "Guest Adventurer",
            )
            await user.type(
                screen.getByLabelText("Email"),
                "guest@example.com",
            )
            await user.type(
                screen.getByPlaceholderText("country code"),
                "AU",
            )
            await user.type(
                screen.getByPlaceholderText("postcode"),
                "3000",
            )
            await user.type(
                screen.getByPlaceholderText("state"),
                "Victoria",
            )
            await user.type(
                screen.getByPlaceholderText("city"),
                "Melbourne",
            )
            await user.type(
                screen.getByPlaceholderText("street"),
                "1 Main Street",
            )
            await user.type(
                screen.getByPlaceholderText("delivery note"),
                "Leave at the front desk",
            )
            await user.click(screen.getByRole("button", {
                name: "Pay with Stripe",
            }))

            await waitFor(() => expect(create).toHaveBeenCalledWith({
                items: [
                    {
                        productId: product.id,
                        quantity: 2,
                    },
                ],
                address: {
                    countryCode: "AU",
                    postcode: "3000",
                    state: "Victoria",
                    city: "Melbourne",
                    street: "1 Main Street",
                },
                deliveryNote: "Leave at the front desk",
                user: {
                    name: "Guest Adventurer",
                    email: "guest@example.com",
                },
                isCreatingAccount: true,
            }))
        },
    )
})
