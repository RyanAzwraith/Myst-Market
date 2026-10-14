import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { mediaFactory } from "../../../../mock_data/media"
import {
    productAnalyticsFactory,
    productFactory,
} from "../../../../mock_data/product"
import { server } from "@/core"
import {
    AdminSearchLoader,
    AnalyticsLoader,
    FeaturedLoader,
    NewestLoader,
    PopularLoader,
    ProductLoader,
    SearchLoader,
    TopLoader,
} from "@/features/product/components/loader"

describe("ProductLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders the loaded product", async () => {
        const product = productFactory({ name: "Loaded Product" })
        vi.spyOn(server.product, "getBySlug").mockResolvedValue({ product })

        renderWithRouter(
            <ProductLoader
                slug="loaded-product"
                render={value => <p>{value.name}</p>}
            />,
        )

        expect(await screen.findByText("Loaded Product"))
            .toBeInTheDocument()
    })

    it("renders loading while the product query is pending", () => {
        vi.spyOn(server.product, "getBySlug").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <ProductLoader
                slug="loaded-product"
                render={value => <p>{value.name}</p>}
            />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("AnalyticsLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders loaded analytics", async () => {
        const product = productAnalyticsFactory({
            name: "Analytics Product",
        })
        vi.spyOn(server.product, "getAnalytics")
            .mockResolvedValue({ product })

        renderWithRouter(
            <AnalyticsLoader
                productId={product.id}
                render={value => <p>{value.name}</p>}
            />,
        )

        expect(await screen.findByText("Analytics Product"))
            .toBeInTheDocument()
    })

    it("renders loading while analytics are pending", () => {
        vi.spyOn(server.product, "getAnalytics").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <AnalyticsLoader
                productId={4}
                render={value => <p>{value.name}</p>}
            />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("SearchLoader intimacy: high", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality passes searched products and indexed images to render",
        async () => {
            const product = productFactory({
                id: 12,
                name: "Searched Product",
            })
            const image = mediaFactory({
                entityId: product.id,
                altText: "Searched image",
            })
            vi.spyOn(server.products, "search").mockResolvedValue({
                products: [product],
                images: [image],
                hasMore: false,
            })

            renderWithRouter(
                <SearchLoader
                    render={({ products, images }) => (
                        <div>
                            <span>{products?.[0]?.name}</span>
                            <span>{images?.[product.id]?.altText}</span>
                        </div>
                    )}
                />,
            )

            expect(await screen.findByText("Searched Product"))
                .toBeInTheDocument()
            expect(screen.getByText("Searched image"))
                .toBeInTheDocument()
        },
    )

    it("passes the query loading state to the render callback", () => {
        vi.spyOn(server.products, "search").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <SearchLoader
                render={({ searchQuery, products }) => (
                    <p>
                        {searchQuery.isLoading ? "Searching..." : "Ready"}
                        {products?.length ?? 0}
                    </p>
                )}
            />,
        )

        expect(screen.getByText("Searching...0")).toBeInTheDocument()
    })
})

describe("AdminSearchLoader intimacy: high", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality passes admin products and selection controls to render",
        async () => {
            const product = productAnalyticsFactory({
                id: 15,
                name: "Admin Product",
            })
            vi.spyOn(server.products, "adminSearch")
                .mockResolvedValue({
                    products: [product],
                    hasMore: false,
                })

            renderWithRouter(
                <AdminSearchLoader
                    render={({ products, selectEdit }) => (
                        <div>
                            <span>{products[0]?.name}</span>
                            <span>
                                {selectEdit.selectedIds.size} selected
                            </span>
                        </div>
                    )}
                />,
            )

            expect(await screen.findByText("Admin Product"))
                .toBeInTheDocument()
            expect(screen.getByText("0 selected")).toBeInTheDocument()
        },
    )

    it("passes an empty product list while the query is pending", () => {
        vi.spyOn(server.products, "adminSearch").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <AdminSearchLoader
                render={({ products }) => (
                    <p>{products.length} products</p>
                )}
            />,
        )

        expect(screen.getByText("0 products")).toBeInTheDocument()
    })
})

describe("FeaturedLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders featured products with indexed images",
        async () => {
            const product = productFactory({ name: "Featured Product" })
            const image = mediaFactory({
                entityId: product.id,
                altText: "Featured image",
            })
            vi.spyOn(server.products, "retrieveFeatured")
                .mockResolvedValue({
                    products: [product],
                    images: [image],
                })

            renderWithRouter(
                <FeaturedLoader
                    render={({ products, images }) => (
                        <div>
                            <span>{products[0]?.name}</span>
                            <span>{images[product.id]?.altText}</span>
                        </div>
                    )}
                />,
            )

            expect(await screen.findByText("Featured Product"))
                .toBeInTheDocument()
            expect(screen.getByText("Featured image"))
                .toBeInTheDocument()
        },
    )

    it("renders loading while featured products are pending", () => {
        vi.spyOn(server.products, "retrieveFeatured").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <FeaturedLoader render={() => <p>Loaded</p>} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("PopularLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders popular products", async () => {
        const product = productFactory({ name: "Popular Product" })
        vi.spyOn(server.products, "retrievePopular")
            .mockResolvedValue({ products: [product], images: [] })

        renderWithRouter(
            <PopularLoader
                render={({ products }) => <p>{products[0]?.name}</p>}
            />,
        )

        expect(await screen.findByText("Popular Product"))
            .toBeInTheDocument()
    })

    it("renders loading while popular products are pending", () => {
        vi.spyOn(server.products, "retrievePopular").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <PopularLoader render={() => <p>Loaded</p>} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("NewestLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders newest products", async () => {
        const product = productFactory({ name: "Newest Product" })
        vi.spyOn(server.products, "retrieveNewest")
            .mockResolvedValue({ products: [product], images: [] })

        renderWithRouter(
            <NewestLoader
                render={({ products }) => <p>{products[0]?.name}</p>}
            />,
        )

        expect(await screen.findByText("Newest Product"))
            .toBeInTheDocument()
    })

    it("renders loading while newest products are pending", () => {
        vi.spyOn(server.products, "retrieveNewest").mockReturnValue(
            new Promise(() => {}),
        )

        renderWithRouter(
            <NewestLoader render={() => <p>Loaded</p>} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})

describe("TopLoader intimacy: medium", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders most-sold products", async () => {
        const product = productAnalyticsFactory({ name: "Top Product" })
        vi.spyOn(server.products, "retrieveMostSoldProducts")
            .mockResolvedValue({ products: [product], images: [] })

        renderWithRouter(
            <TopLoader
                render={({ products }) => <p>{products[0]?.name}</p>}
            />,
        )

        expect(await screen.findByText("Top Product"))
            .toBeInTheDocument()
    })

    it("renders loading while most-sold products are pending", () => {
        vi.spyOn(server.products, "retrieveMostSoldProducts")
            .mockReturnValue(new Promise(() => {}))

        renderWithRouter(
            <TopLoader render={() => <p>Loaded</p>} />,
        )

        expect(screen.getByText("Loading...")).toBeInTheDocument()
    })
})
