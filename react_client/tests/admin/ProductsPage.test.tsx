import { beforeEach, describe, expect, test, vi } from "vitest"
import { screen, within } from "@testing-library/react"
import { userEvent, type UserEvent } from "@testing-library/user-event"

import { renderWithRouter, resetAuthState } from "../utils"
import {
	makeProductAnalytics,
	mockShopFilters,
} from "./AdminMock"
import { ProductsPage } from "@/features/admin/ProductsPage"

const productMocks = vi.hoisted(() => ({
	mockUseProductParams: vi.fn(),
	mockUseProductsInfiniteQuery: vi.fn(),
	mockUseProductAnalyticsQuery: vi.fn(),
	mockUsePostProductMutation: vi.fn(),
	mockPostProduct: vi.fn(),
	mockUsePatchProductBulkMutation: vi.fn(),
	mockPatchProducts: vi.fn(),
	mockUsePatchProductMutation: vi.fn(),
	mockPatchProduct: vi.fn(),
	mockUseDeleteProductMutation: vi.fn(),
	mockDeleteProduct: vi.fn(),
}))

vi.mock("@/features/admin/AdminService", () => ({
	useProductParams: productMocks.mockUseProductParams,
	useProductsInfiniteQuery: productMocks.mockUseProductsInfiniteQuery,
	useProductAnalyticsQuery:
		productMocks.mockUseProductAnalyticsQuery,
	usePostProductMutation: productMocks.mockUsePostProductMutation,
	usePatchProductBulkMutation:
		productMocks.mockUsePatchProductBulkMutation,
	usePatchProductMutation: productMocks.mockUsePatchProductMutation,
	useDeleteProductMutation:
		productMocks.mockUseDeleteProductMutation,
}))

const {
	mockDeleteProduct,
	mockPatchProducts,
	mockPostProduct,
	mockUseDeleteProductMutation,
	mockUsePostProductMutation,
	mockUsePatchProductBulkMutation,
	mockPatchProduct,
	mockUsePatchProductMutation,
	mockUseProductAnalyticsQuery,
	mockUseProductParams,
	mockUseProductsInfiniteQuery,
} = productMocks

let user: UserEvent

const defaultProduct = makeProductAnalytics({
	id: 7,
	name: "Moon Orb",
	slug: "moon-orb",
})

function makeFilter<T>(value: T, options?: Record<string, string>) {
	return {
		get: () => value,
		options,
	}
}

beforeEach(() => {
	user = userEvent.setup()
	vi.clearAllMocks()
	resetAuthState()
	mockShopFilters()

	mockUseProductParams.mockReturnValue({
		categories: makeFilter([], { magic: "Magic" }),
		getParams: () => ({}),
		isAscending: makeFilter(false),
		isDiscontinued: makeFilter(false),
		rarities: makeFilter([], { rare: "Rare" }),
		search: makeFilter(""),
		sortBy: makeFilter("newest", {
			newest: "Newest",
		}),
	})

	mockUseProductsInfiniteQuery.mockReturnValue({
		data: {
			pages: [{ products: [defaultProduct] }],
		},
		fetchNextPage: vi.fn(),
		hasNextPage: false,
	})

	mockUseProductAnalyticsQuery.mockReturnValue({
		data: { product: defaultProduct },
		isLoading: false,
		isError: false,
	})

	mockUsePostProductMutation.mockReturnValue({
		mutate: mockPostProduct,
		isPending: false,
	})

	mockUsePatchProductBulkMutation.mockReturnValue({
		mutate: mockPatchProducts,
	})
	mockUsePatchProductMutation.mockReturnValue({
		mutate: mockPatchProduct,
		isPending: false,
	})
	mockUseDeleteProductMutation.mockReturnValue({
		mutate: mockDeleteProduct,
		isPending: false,
	})
})

describe("ProductsPage", () => {
	test("renders the default title and product card", async () => {
		renderWithRouter(<ProductsPage />)

		expect(await screen.findByText("All Products")).toBeVisible()
		expect(await screen.findByText("Moon Orb")).toBeVisible()
	})

	test("creates a product from the create modal", async () => {
		renderWithRouter(<ProductsPage />)

		await user.click(screen.getByRole("button", {
			name: "Create product",
		}))
		const dialog = screen.getByRole("dialog")
		const modal = within(dialog)

		await user.type(modal.getByLabelText("Name"), "Sun Charm")
		await user.type(modal.getByLabelText("Category"), "magic")
		await user.type(modal.getByLabelText("Rarity"), "rare")
		await user.clear(modal.getByLabelText("Price (cents)"))
		await user.type(modal.getByLabelText("Price (cents)"), "1200")
		await user.type(modal.getByLabelText("Slug"), "sun-charm")
		await user.type(
			modal.getByLabelText("Description"),
			"A sunny charm.",
		)
		await user.clear(modal.getByLabelText("Stock"))
		await user.type(modal.getByLabelText("Stock"), "8")
		await user.click(modal.getByRole("button", {
			name: "Create product",
		}))

		expect(mockPostProduct).toHaveBeenCalledWith({
			name: "Sun Charm",
			categoryName: "magic",
			rarityName: "rare",
			priceAudCent: 1200,
			slug: "sun-charm",
			description: "A sunny charm.",
			stock: 8,
		}, expect.objectContaining({
			onSuccess: expect.any(Function),
		}))
	})

	test("renders the searching title", async () => {
		mockUseProductParams.mockReturnValueOnce({
			categories: makeFilter([], {}),
			getParams: () => ({ search: "moon" }),
			isAscending: makeFilter(false),
			isDiscontinued: makeFilter(false),
			rarities: makeFilter([], {}),
			search: makeFilter("moon"),
			sortBy: makeFilter("newest", {}),
		})

		renderWithRouter(<ProductsPage />)

		expect(await screen.findByText("Searching: moon")).toBeVisible()
	})

	test("fetches the next page when the chevron is clicked", async () => {
		const fetchNextPage = vi.fn()
		mockUseProductsInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ products: [defaultProduct] }],
			},
			fetchNextPage,
			hasNextPage: true,
		})

		renderWithRouter(<ProductsPage />)
		await user.click(await screen.findByLabelText("ChevronDownIcon"))

		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	test("updates selected products with only bulk-editable fields", async () => {
		const secondProduct = makeProductAnalytics({
			id: 8,
			name: "Sun Charm",
		})
		mockUseProductsInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ products: [defaultProduct, secondProduct] }],
			},
			fetchNextPage: vi.fn(),
			hasNextPage: false,
		})

		renderWithRouter(<ProductsPage />)
		await user.click(screen.getByRole("checkbox", {
			name: "Select all",
		}))
		await user.selectOptions(
			await screen.findByLabelText("Category"),
			"magic"
		)
		await user.clear(await screen.findByLabelText("Stock"))
		await user.type(await screen.findByLabelText("Stock"), "12")
		await user.click(await screen.findByRole("button", {
			name: "Update selected",
		}))

		const expectedData = {
			categoryName: "magic",
			rarityName: null,
			priceAudCent: null,
			stock: 12,
		}
		expect(mockPatchProducts).toHaveBeenCalledWith({
			productIds: [7, 8],
			...expectedData,
		})
	})

	test("does not render non-bulk-editable fields", async () => {
		renderWithRouter(<ProductsPage />)

		expect(screen.queryByLabelText("Name")).toBeNull()
		expect(screen.queryByLabelText("Slug")).toBeNull()
		expect(screen.queryByLabelText("Description")).toBeNull()
	})
})

describe("ProductCard and ProductModal", () => {
	test("opens the product details modal", async () => {
		renderWithRouter(<ProductsPage />)

		await user.click(await screen.findByText("Moon Orb"))
		expect(await screen.findByText("Product Details")).toBeVisible()
		expect(await screen.findByText("Description: A sample product.")
		).toBeVisible()
	})

	test("updates the product from the details modal", async () => {
		renderWithRouter(<ProductsPage />)

		await user.click(await screen.findByText("Moon Orb"))
		await user.clear(await screen.findByLabelText("Name"))
		await user.type(await screen.findByLabelText("Name"), "Updated Orb")
		await user.click(await screen.findByRole("button", {
			name: "Update product",
		}))

		expect(mockPatchProduct).toHaveBeenCalledWith({
			productId: 7,
			data: {
				name: "Updated Orb",
				categoryName: "magic",
				rarityName: "rare",
				priceAudCent: 1500,
				slug: "moon-orb",
				description: "A sample product.",
				stock: 5,
			},
		})
	})

	test("shows the loading state", async () => {
		mockUseProductAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<ProductsPage />)
		await user.click(await screen.findByText("Moon Orb"))

		expect(await screen.findByText("Loading...")).toBeVisible()
	})

	test("shows the error state", async () => {
		mockUseProductAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<ProductsPage />)
		await user.click(await screen.findByText("Moon Orb"))

		expect(await screen.findByText("Error loading product details"))
			.toBeVisible()
	})

	test("deletes the product from the details modal", async () => {
		renderWithRouter(<ProductsPage />)

		await user.click(await screen.findByText("Moon Orb"))
		await user.click(await screen.findByRole("button", {
			name: "Delete product",
		}))

		expect(mockDeleteProduct).toHaveBeenCalledWith(
			7,
			expect.objectContaining({ onSuccess: expect.any(Function) })
		)
	})
})
