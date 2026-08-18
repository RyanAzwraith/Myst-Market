import { beforeEach, describe, expect, test, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { renderWithRouter, resetAuthState } from "../utils"
import {
	makeOrderSummary,
	makeProductAnalytics,
	mockUsePerformanceQuery,
	mockUseAttentionQuery,
	mockUseGraphQuery,
	mockUseRecentOrdersQuery,
	mockUseTopProductsQuery,
} from "./AdminMock"
import { DashboardPage } from "@/features/admin/DashboardPage"

vi.mock("@/features/admin/AdminService", () => ({
	usePerformanceQuery: mockUsePerformanceQuery,
	useAttentionQuery: mockUseAttentionQuery,
	useGraphQuery: mockUseGraphQuery,
	useRecentOrdersQuery: mockUseRecentOrdersQuery,
	useTopProductsQuery: mockUseTopProductsQuery,
}))

const defaultOrder = makeOrderSummary({
	orderId: 1042,
	totalCent: 12400,
	status: "processing",
})

const defaultProduct = makeProductAnalytics({
	name: "Moon Orb",
	unitsSold: 43,
})

beforeEach(() => {
	vi.clearAllMocks()
	resetAuthState()

	mockUsePerformanceQuery.mockReturnValue({
		data: {
			periodDays: 30,
			revenue: 1245000,
			orders: 183,
			newCustomers: 1240,
			revenueLost: 124000,
			previousRevenue: 1089980,
			previousOrders: 169,
			previousNewCustomers: 1180,
			previousRevenueLost: 141552,
		},
		isLoading: false,
		isError: false,
	})
	mockUseAttentionQuery.mockReturnValue({
		data: {
			pendingOrders: 8,
			outOfStockProducts: 4,
			salesEnding: 3,
		},
		isLoading: false,
		isError: false,
	})
	mockUseGraphQuery.mockReturnValue({
		data: {
			points: [
				{ month: "Sep", revenue: 100000, orders: 12 },
				{ month: "Oct", revenue: 125000, orders: 15 },
			],
		},
		isLoading: false,
		isError: false,
	})

	mockUseRecentOrdersQuery.mockReturnValue({
		data: { orders: [defaultOrder] },
		isLoading: false,
		isError: false,
	})
	mockUseTopProductsQuery.mockReturnValue({
		data: { products: [defaultProduct] },
		isLoading: false,
		isError: false,
	})
})

describe("DashboardPage", () => {
	test("renders recent orders and top products", async () => {
		renderWithRouter(<DashboardPage />)

		expect(await screen.findByRole("heading", {
			name: "Admin Dashboard",
		})).toBeVisible()
		expect(await screen.findByRole("heading", {
			name: "Recent Orders",
		})).toBeVisible()
		expect(await screen.findByRole("heading", {
			name: "Top Products",
		})).toBeVisible()
		expect(await screen.findByRole("heading", {
			name: "Revenue / Orders",
		})).toBeVisible()
		expect(await screen.findByText("#1042")).toBeVisible()
		expect(await screen.findByText("$ 124")).toBeVisible()
		expect(await screen.findByText("processing")).toBeVisible()
		expect(await screen.findByText("Moon Orb")).toBeVisible()
		expect(await screen.findByText("43")).toBeVisible()
		expect(await screen.findByText("↑ 14.2%")).toBeVisible()
		expect(await screen.findByText("↑ 8.3%")).toBeVisible()
		expect(await screen.findByText("↑ 5.1%")).toBeVisible()
		expect(await screen.findByText("↓ 12.4%")).toBeVisible()
		expect(await screen.findByText(/8 orders pending/)).toBeVisible()
		expect(await screen.findByText(/4 out of stock products/)).toBeVisible()
		expect(await screen.findByText(/3 sales ending/)).toBeVisible()
		expect(mockUsePerformanceQuery).toHaveBeenCalledWith(30)
		expect(mockUseAttentionQuery).toHaveBeenCalledTimes(1)
		expect(mockUseGraphQuery).toHaveBeenCalledTimes(1)
		expect(mockUseRecentOrdersQuery).toHaveBeenCalledTimes(1)
		expect(mockUseTopProductsQuery).toHaveBeenCalledTimes(1)
	})

	test("renders the graph loading state", async () => {
		mockUseGraphQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Loading...")).toBeVisible()
		expect(await screen.findByText("Requires Attention")).toBeVisible()
	})

	test("renders the graph error state", async () => {
		mockUseGraphQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Error loading graph")).toBeVisible()
		expect(await screen.findByText("Requires Attention")).toBeVisible()
	})

	   test("renders the attention loading state", async () => {
		   mockUseAttentionQuery.mockReturnValueOnce({
			   data: null,
			   isLoading: true,
			   isError: false,
		   })

		   renderWithRouter(<DashboardPage />)

		   expect(await screen.findByText("Loading...")).toBeVisible()
		   expect(await screen.findByText("Recent Orders")).toBeVisible()
	   })

	   test("renders the attention error state", async () => {
		   mockUseAttentionQuery.mockReturnValueOnce({
			   data: null,
			   isLoading: false,
			   isError: true,
		   })

		   renderWithRouter(<DashboardPage />)

		   expect(await screen.findByText("Error loading attention items"))
			   .toBeVisible()
		   expect(await screen.findByText("Recent Orders")).toBeVisible()
	   })

	test("changes the performance period", async () => {
		const user = userEvent.setup()
		mockUsePerformanceQuery.mockImplementation((periodDays: number) => ({
			data: {
				periodDays,
				revenue: 1245000,
				orders: 183,
				newCustomers: 1240,
				revenueLost: 124000,
				previousRevenue: 1089980,
				previousOrders: 169,
				previousNewCustomers: 1180,
				previousRevenueLost: 141552,
			},
			isLoading: false,
			isError: false,
		}))

		renderWithRouter(<DashboardPage />)

		await user.selectOptions(
			await screen.findByRole("combobox", {
				name: "Performance period",
			}),
			"90",
		)

		expect(mockUsePerformanceQuery).toHaveBeenNthCalledWith(1, 30)
		expect(mockUsePerformanceQuery).toHaveBeenNthCalledWith(2, 90)
	})

	test("renders the performance loading state", async () => {
		mockUsePerformanceQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Loading...")).toBeVisible()
		expect(await screen.findByText("Recent Orders")).toBeVisible()
	})

	test("renders the performance error state", async () => {
		mockUsePerformanceQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Error loading performance"))
			.toBeVisible()
		expect(await screen.findByText("Top Products")).toBeVisible()
	})

	test("renders the recent orders loading state", async () => {
		mockUseRecentOrdersQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Loading...")).toBeVisible()
		expect(await screen.findByText("Moon Orb")).toBeVisible()
	})

	test("renders the recent orders error state", async () => {
		mockUseRecentOrdersQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Error loading recent orders"))
			.toBeVisible()
		expect(await screen.findByText("Moon Orb")).toBeVisible()
	})

	test("renders the top products loading and error states", async () => {
		mockUseTopProductsQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Loading...")).toBeVisible()
		expect(await screen.findByText("#1042")).toBeVisible()

		mockUseTopProductsQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<DashboardPage />)

		expect(await screen.findByText("Error loading top products"))
			.toBeVisible()
		expect(await screen.findByText("#1042")).toBeVisible()
	})
})
