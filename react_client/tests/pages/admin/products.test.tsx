import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../utils"
import { productAnalyticsFactory } from "../../../mock_data/product"
import { server } from "@/core"
import { ProductsPage } from "@/pages/admin/products"

describe("ProductsPage intimacy: high", () => {
    it("functionality renders product results and bulk controls",
        async () => {
            const product = productAnalyticsFactory({
                id: 51,
                name: "Admin Product",
                categoryName: "artifacts",
                rarityName: "rare",
                stock: 6,
            })
            const adminSearch = vi.spyOn(server.products, "adminSearch")
                .mockResolvedValue({
                    products: [product],
                    hasMore: false,
                })

            renderWithRouter(<ProductsPage />, {
                path: "/product",
                initialPath: "/product",
            })

            expect(screen.getByRole("button", {
                name: "Create product",
            })).toBeInTheDocument()
            expect(await screen.findByText("Admin Product"))
                .toBeInTheDocument()
            expect(screen.getByText("artifacts - rare"))
                .toBeInTheDocument()
            expect(screen.getByText("Stock: 6"))
                .toBeInTheDocument()
            expect(screen.getByText("All Products"))
                .toBeInTheDocument()
            expect(screen.getByRole("button", {
                name: "Update selected",
            })).toBeDisabled()
            expect(adminSearch).toHaveBeenCalledWith({
                searchParams: {
                    sort: "newest",
                    categories: [],
                    rarities: [],
                    search: "",
                    isDiscontinued: false,
                    isAscending: false,
                },
                limit: 20,
                offset: 0,
            })
        },
    )

    it("opens the create-product form", async () => {
        vi.spyOn(server.products, "adminSearch")
            .mockResolvedValue({ products: [], hasMore: false })
        const user = userEvent.setup()

        renderWithRouter(<ProductsPage />, {
            path: "/product",
            initialPath: "/product",
        })

        await user.click(screen.getByRole("button", {
            name: "Create product",
        }))

        expect(screen.getByRole("dialog", { name: "Modal" }))
            .toBeInTheDocument()
        expect(screen.getByRole("heading", {
            name: "Create Product",
        })).toBeInTheDocument()
        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getAllByRole("button", {
            name: "Create product",
        })).toHaveLength(2)
    })

    it("offers another page when the server reports more products",
        async () => {
            const product = productAnalyticsFactory({
                id: 52,
                name: "Second Page Product",
            })
            vi.spyOn(server.products, "adminSearch")
                .mockResolvedValue({
                    products: [product],
                    hasMore: true,
                })

            renderWithRouter(<ProductsPage />, {
                path: "/product",
                initialPath: "/product",
            })

            await screen.findByText("Second Page Product")
            expect(await screen.findByRole("button", {
                name: "Load more content",
            })).toBeInTheDocument()
        },
    )
})
