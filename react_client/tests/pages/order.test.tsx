import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../utils"
import { mediaFactory } from "../../mock_data/media"
import { itemResolutionFactory } from "../../mock_data/item"
import { orderFactory } from "../../mock_data/order"
import { server } from "@/core"
import { OrderPage } from "@/pages/order"

describe("OrderPage intimacy: high", () => {
    it("functionality renders order details and resolved items", async () => {
        const item = itemResolutionFactory({
            product: {
                id: 31,
                saleID: null,
                name: "Ordered Amulet",
                slug: "ordered-amulet",
            },
            quantity: 2,
            unitPriceCent: 1500,
            lineTotalCent: 3000,
        })
        const order = orderFactory({
            id: 8,
            addressString: "1 Main Street, Melbourne",
            createdAt: "2026-05-02",
            costAudCent: 4200,
            items: [item],
        })
        const media = mediaFactory({
            id: 12,
            entityId: item.product.id,
            altText: "Ordered amulet image",
            mediaUrl: "/ordered-amulet.jpg",
        })
        const getById = vi.spyOn(server.order, "getById")
            .mockResolvedValue({
                order,
                user: {
                    id: order.userId,
                    name: "Customer",
                    email: "customer@example.com",
                    isAdmin: false,
                    isRegistered: true,
                },
            })
        const getImage = vi.spyOn(server.product, "getImage")
            .mockResolvedValue({ media })

        renderWithRouter(<OrderPage />, {
            path: "/order/:id",
            initialPath: "/order/8",
        })

        expect(screen.getByRole("heading", { name: "Order" }))
            .toBeInTheDocument()
        expect(await screen.findByText(
            "Delivery address: 1 Main Street, Melbourne",
        )).toBeInTheDocument()
        expect(screen.getByText("Placed 2026-05-02"))
            .toBeInTheDocument()
        expect(screen.getByText(/Total:/))
            .toHaveTextContent("Total: $ 4200.00")
        expect(screen.getByText("Ordered Amulet")).toBeInTheDocument()
        expect(await screen.findByAltText("Ordered amulet image"))
            .toBeInTheDocument()

        await waitFor(() => {
            expect(getById).toHaveBeenCalledWith(8)
            expect(getImage).toHaveBeenCalledWith(31)
        })
    })

    it("navigates to the product page when an item is selected",
        async () => {
            const item = itemResolutionFactory({
                product: {
                    id: 32,
                    saleID: null,
                    name: "Selected Relic",
                    slug: "selected-relic",
                },
            })
            const order = orderFactory({
                id: 9,
                items: [item],
            })
            vi.spyOn(server.order, "getById")
                .mockResolvedValue({
                    order,
                    user: {
                        id: order.userId,
                        name: "Customer",
                        email: "customer@example.com",
                        isAdmin: false,
                        isRegistered: true,
                    },
                })
            vi.spyOn(server.product, "getImage")
                .mockResolvedValue({
                    media: mediaFactory({ entityId: item.product.id }),
                })
            const user = userEvent.setup()

            renderWithRouter(<OrderPage />, {
                path: "/order/:id",
                initialPath: "/order/9",
            })

            await screen.findByText("Selected Relic")
            await user.click(screen.getByText("Selected Relic"))

            expect(screen.getByTestId("location"))
                .toHaveTextContent("/product/selected-relic")
        },
    )

    it("shows loading while the order is unavailable", () => {
        const getById = vi.spyOn(server.order, "getById")
            .mockReturnValue(new Promise(() => {}))

        renderWithRouter(<OrderPage />, {
            path: "/order/:id",
            initialPath: "/order/8",
        })

        expect(screen.getByRole("heading", { name: "Order" }))
            .toBeInTheDocument()
        expect(screen.getByText("Loading...")).toBeInTheDocument()
        expect(getById).toHaveBeenCalledWith(8)
    })

    it("redirects to the profile when the order id is missing", async () => {
        const getById = vi.spyOn(server.order, "getById")

        renderWithRouter(<OrderPage />, {
            path: "*",
            initialPath: "/",
        })

        await waitFor(() => expect(screen.getByTestId("location"))
            .toHaveTextContent("/profile"))
        expect(getById).not.toHaveBeenCalled()
    })
})
