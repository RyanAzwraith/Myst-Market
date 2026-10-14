import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { productFactory } from "../../../../mock_data/product"
import {
    AdminSearchTitle,
    PriceFormat,
    ProductSearchTitle,
} from "@/features/product/components/presentation"
import {
    useAdminSearchParams,
    useSearchParams,
} from "@/features/product/hook"

function SearchTitleHarness() {
    const searchParams = useSearchParams()
    return <ProductSearchTitle searchParams={searchParams} />
}

function AdminSearchTitleHarness() {
    const searchParams = useAdminSearchParams()
    return <AdminSearchTitle adminSearchParams={searchParams} />
}

describe("PriceFormat intimacy: low", () => {
    it("functionality renders the regular product price", () => {
        const product = productFactory({
            priceAudCent: 2500,
            discountedPrice: null,
            sale: null,
        })

        renderWithRouter(<PriceFormat product={product} />)

        expect(screen.getByText("$ 2500.00")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renders regular and discounted prices for a sale", () => {
        const sale = {
            name: "Spring Sale",
            slug: "spring-sale",
            discountPerc: 20,
        }
        const product = productFactory({
            priceAudCent: 2500,
            discountedPrice: 2000,
            sale,
        })

        renderWithRouter(<PriceFormat product={product} />)

        expect(screen.getByText("$ 2500.00")).toBeInTheDocument()
        expect(screen.getByText("$ 2000.00")).toBeInTheDocument()
        expect(screen.getByText("Spring Sale")).toBeInTheDocument()
    })

    it("passes the sale to onClick when discounted pricing is selected",
        async () => {
            const sale = {
                name: "Spring Sale",
                slug: "spring-sale",
                discountPerc: 20,
            }
            const product = productFactory({
                discountedPrice: 2000,
                sale,
            })
            const onClick = vi.fn()
            const user = userEvent.setup()

            renderWithRouter(
                <PriceFormat product={product} onClick={onClick} />,
            )
            await user.click(screen.getByRole("button"))

            expect(onClick).toHaveBeenCalledWith(sale)
        },
    )
})

describe("ProductSearchTitle intimacy: medium", () => {
    it("functionality displays the default title", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/shop",
        })

        expect(screen.getByText("All Products")).toBeInTheDocument()
    })

    it("displays the active product search", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/shop?search=amulet",
        })

        expect(screen.getByText("Searching: amulet"))
            .toBeInTheDocument()
    })

    it("displays selected product categories", () => {
        renderWithRouter(<SearchTitleHarness />, {
            initialPath: "/shop?categories=artifacts,potions",
        })

        expect(screen.getByText("artifacts, potions"))
            .toBeInTheDocument()
    })
})

describe("AdminSearchTitle intimacy: medium", () => {
    it("functionality displays the default title", () => {
        renderWithRouter(<AdminSearchTitleHarness />, {
            initialPath: "/product",
        })

        expect(screen.getByText("All Products")).toBeInTheDocument()
    })

    it("displays search, category, and rarity filters", () => {
        renderWithRouter(<AdminSearchTitleHarness />, {
            initialPath: "/product?categories=artifacts"
                + "&rarities=legendary",
        })

        expect(screen.getByText("artifacts, legendary"))
            .toBeInTheDocument()
    })
})
