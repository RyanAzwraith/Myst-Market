import { beforeEach, describe, expect, test, vi } from "vitest"
import { fireEvent, screen, within } from "@testing-library/react"
import { userEvent, type UserEvent } from "@testing-library/user-event"

import { renderWithRouter, resetAuthState } from "../utils"
import {
	makeSaleAnalytics,
	mockShopFilters,
} from "./AdminMock"
import { SalesPage } from "@/features/admin/SalesPage"

const saleMocks = vi.hoisted(() => ({
	mockUseSaleParams: vi.fn(),
	mockUseSalesInfiniteQuery: vi.fn(),
	mockUseSaleAnalyticsQuery: vi.fn(),
	mockUsePostSaleMutation: vi.fn(),
	mockPostSale: vi.fn(),
	mockUsePatchSaleBulkMutation: vi.fn(),
	mockPatchSales: vi.fn(),
	mockUsePatchSaleMutation: vi.fn(),
	mockPatchSale: vi.fn(),
	mockUseDeleteSaleMutation: vi.fn(),
	mockDeleteSale: vi.fn(),
}))

vi.mock("@/features/admin/AdminService", () => ({
	useSaleParams: saleMocks.mockUseSaleParams,
	useSalesInfiniteQuery: saleMocks.mockUseSalesInfiniteQuery,
	useSaleAnalyticsQuery: saleMocks.mockUseSaleAnalyticsQuery,
	usePostSaleMutation: saleMocks.mockUsePostSaleMutation,
	usePatchSaleBulkMutation:
		saleMocks.mockUsePatchSaleBulkMutation,
	usePatchSaleMutation: saleMocks.mockUsePatchSaleMutation,
	useDeleteSaleMutation: saleMocks.mockUseDeleteSaleMutation,
}))

const {
	mockDeleteSale,
	mockPatchSale,
	mockPatchSales,
	mockPostSale,
	mockUseDeleteSaleMutation,
	mockUsePostSaleMutation,
	mockUsePatchSaleBulkMutation,
	mockUsePatchSaleMutation,
	mockUseSaleAnalyticsQuery,
	mockUseSaleParams,
	mockUseSalesInfiniteQuery,
} = saleMocks

let user: UserEvent

const defaultSale = makeSaleAnalytics({
	id: 7,
	name: "Moon Sale",
	slug: "moon-sale",
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

	mockUseSaleParams.mockReturnValue({
		activation: makeFilter([], { active: "Active" }),
		getParams: () => ({}),
		isAscending: makeFilter(false),
		search: makeFilter(""),
		sortBy: makeFilter("startAt", { startAt: "Start At" }),
	})

	mockUseSalesInfiniteQuery.mockReturnValue({
		data: {
			pages: [{ sales: [defaultSale] }],
		},
		fetchNextPage: vi.fn(),
		hasNextPage: false,
	})

	mockUseSaleAnalyticsQuery.mockReturnValue({
		data: { sale: defaultSale },
		isLoading: false,
		isError: false,
	})

	mockUsePostSaleMutation.mockReturnValue({
		mutate: mockPostSale,
		isPending: false,
	})

	mockUsePatchSaleBulkMutation.mockReturnValue({
		mutate: mockPatchSales,
	})
	mockUsePatchSaleMutation.mockReturnValue({
		mutate: mockPatchSale,
		isPending: false,
	})
	mockUseDeleteSaleMutation.mockReturnValue({
		mutate: mockDeleteSale,
		isPending: false,
	})
})

describe("SalesPage", () => {
	test("renders the default title and sale card", async () => {
		renderWithRouter(<SalesPage />)

		expect(await screen.findByText("All Sales")).toBeVisible()
		expect(await screen.findByText("Moon Sale")).toBeVisible()
	})

	test("creates a sale from the create modal", async () => {
		renderWithRouter(<SalesPage />)

		await user.click(screen.getByRole("button", {
			name: "Create sale",
		}))
		const modal = within(screen.getByRole("dialog"))

		await user.type(modal.getByLabelText("Name"), "Summer Sale")
		await user.type(modal.getByLabelText("Slug"), "summer-sale")
		await user.type(
			modal.getByLabelText("Description"),
			"A summer discount.",
		)
		await user.clear(modal.getByLabelText("Discount percent"))
		await user.type(modal.getByLabelText("Discount percent"), "20")
		fireEvent.change(modal.getByLabelText("Start date"), {
			target: { value: "2026-06-01T10:00" },
		})
		fireEvent.change(modal.getByLabelText("End date"), {
			target: { value: "2026-06-30T10:00" },
		})
		await user.click(modal.getByRole("button", {
			name: "Create sale",
		}))

		expect(mockPostSale).toHaveBeenCalledWith({
			name: "Summer Sale",
			slug: "summer-sale",
			description: "A summer discount.",
			discountPercent: 20,
			startAt: new Date("2026-06-01T10:00"),
			endAt: new Date("2026-06-30T10:00"),
		}, expect.objectContaining({
			onSuccess: expect.any(Function),
		}))
	})

	test("renders the searching title", async () => {
		mockUseSaleParams.mockReturnValueOnce({
			activation: makeFilter([], {}),
			getParams: () => ({ search: "moon" }),
			isAscending: makeFilter(false),
			search: makeFilter("moon"),
			sortBy: makeFilter("startAt", {}),
		})

		renderWithRouter(<SalesPage />)

		expect(await screen.findByText("Searching: moon")).toBeVisible()
	})

	test("fetches the next page when the chevron is clicked", async () => {
		const fetchNextPage = vi.fn()
		mockUseSalesInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ sales: [defaultSale] }],
			},
			fetchNextPage,
			hasNextPage: true,
		})

		renderWithRouter(<SalesPage />)
		await user.click(await screen.findByLabelText("ChevronDownIcon"))

		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	test("updates selected sales with bulk-editable fields", async () => {
		const secondSale = makeSaleAnalytics({
			id: 8,
			name: "Sun Sale",
		})
		mockUseSalesInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ sales: [defaultSale, secondSale] }],
			},
			fetchNextPage: vi.fn(),
			hasNextPage: false,
		})

		renderWithRouter(<SalesPage />)
		await user.click(screen.getByRole("checkbox", {
			name: "Select all",
		}))
		await user.type(
			await screen.findByLabelText("Start date"),
			"2026-06-01T10:00",
		)
		await user.type(
			await screen.findByLabelText("End date"),
			"2026-06-30T10:00",
		)
		await user.clear(await screen.findByLabelText("Discount percent"))
		await user.type(await screen.findByLabelText("Discount percent"), "25")
		await user.click(await screen.findByRole("button", {
			name: "Update selected",
		}))

		expect(mockPatchSales).toHaveBeenCalledWith({
			saleIds: [7, 8],
			startAt: new Date("2026-06-01T10:00"),
			endAt: new Date("2026-06-30T10:00"),
			discountPercent: 25,
		})
	})
})

describe("SaleModal", () => {
	test("opens the sale details modal", async () => {
		renderWithRouter(<SalesPage />)

		await user.click(await screen.findByText("Moon Sale"))
		expect(await screen.findByText("Sale Details")).toBeVisible()
		expect(await screen.findByDisplayValue("moon-sale")).toBeVisible()
	})

	test("updates the sale from the details modal", async () => {
		renderWithRouter(<SalesPage />)

		await user.click(await screen.findByText("Moon Sale"))
		await user.clear(await screen.findByLabelText("Name"))
		await user.type(await screen.findByLabelText("Name"), "Updated Sale")
		await user.click(await screen.findByRole("button", {
			name: "Update sale",
		}))

		expect(mockPatchSale).toHaveBeenCalledWith({
			saleId: 7,
			data: {
				name: "Updated Sale",
				slug: "moon-sale",
				description: "A sample sale.",
				startAt: new Date("2026-01-01T00:00:00.000Z"),
				endAt: new Date("2026-12-31T23:59:59.000Z"),
				discountPercent: 10,
			},
		})
	})

	test("shows the loading state", async () => {
		mockUseSaleAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<SalesPage />)
		await user.click(await screen.findByText("Moon Sale"))

		expect(await screen.findByText("Loading...")).toBeVisible()
	})

	test("shows the error state", async () => {
		mockUseSaleAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<SalesPage />)
		await user.click(await screen.findByText("Moon Sale"))

		expect(await screen.findByText("Error loading sale details"))
			.toBeVisible()
	})

	test("deletes the sale from the details modal", async () => {
		renderWithRouter(<SalesPage />)

		await user.click(await screen.findByText("Moon Sale"))
		await user.click(await screen.findByRole("button", {
			name: "Delete sale",
		}))

		expect(mockDeleteSale).toHaveBeenCalledWith(7)
	})
})
