import { beforeEach, describe, expect, test, vi } from "vitest"
import { screen } from "@testing-library/react"
import { userEvent, type UserEvent } from "@testing-library/user-event"

import { renderWithRouter, resetAuthState } from "../utils"
import { OrdersPage } from "@/features/admin/OrdersPage"
import {
	makeOrderSummary,
	makeOrderUserResponse,
} from "./AdminMock"

const orderMocks = vi.hoisted(() => ({
	mockUseOrderParams: vi.fn(),
	mockUseOrdersInfiniteQuery: vi.fn(),
	mockUseOrderQuery: vi.fn(),
	mockUsePatchOrderStatusMutation: vi.fn(),
	mockPatchOrderStatus: vi.fn(),
	mockUsePatchOrderBulk: vi.fn(),
	mockPatchOrderBulk: vi.fn(),
}))

const uiMocks = vi.hoisted(() => ({
	MockQueryParamsContainer: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	MockTextFilterField: () => <div>TextFilterField</div>,
	MockSelectMultipleFilterField: () => (
		<div>SelectMultipleFilterField</div>
	),
	MockSelectOneFilterField: () => <div>SelectOneFilterField</div>,
	MockImageComponent: ({ altText }: { altText: string }) => (
		<img alt={altText} />
	),
}))

vi.mock("@/features/admin/AdminService", () => ({
	useOrderParams: orderMocks.mockUseOrderParams,
	useOrdersInfiniteQuery: orderMocks.mockUseOrdersInfiniteQuery,
	useOrderQuery: orderMocks.mockUseOrderQuery,
	usePatchOrderStatusMutation:
		orderMocks.mockUsePatchOrderStatusMutation,
	usePatchOrderBulk: orderMocks.mockUsePatchOrderBulk,
}))

vi.mock("@/shared/QueryParamsComponent", () => ({
	QueryParamsContainer: uiMocks.MockQueryParamsContainer,
	TextFilterField: uiMocks.MockTextFilterField,
	SelectMultipleFilterField: uiMocks.MockSelectMultipleFilterField,
	SelectOneFilterField: uiMocks.MockSelectOneFilterField,
}))


const {
	mockPatchOrderStatus,
	mockUseOrderParams,
	mockUseOrderQuery,
	mockUseOrdersInfiniteQuery,
	mockUsePatchOrderStatusMutation,
	mockUsePatchOrderBulk,
	mockPatchOrderBulk,
} = orderMocks

let user: UserEvent

const defaultOrderSummary = makeOrderSummary({
	orderId: 7,
	totalCent: 1234,
	status: "processing",
})

const defaultOrderQueryData = makeOrderUserResponse({
	order: {
		...makeOrderUserResponse().order,
		userId: 10,
		addressString: "123 Sample St",
		status: "processing",
	},
	user: {
		id: 10,
		name: "Alex",
		email: "alex@example.com",
		isRegistered: true,
	},
})

beforeEach(() => {
	user = userEvent.setup()
	vi.clearAllMocks()
	resetAuthState()

	mockUseOrderParams.mockReturnValue({
		sortBy: {},
		status: { get: () => [] },
		searchName: { get: () => "" },
		getParams: () => ({}),
	})

	mockUseOrdersInfiniteQuery.mockReturnValue({
		data: {
			pages: [{ orders: [defaultOrderSummary] }],
		},
		fetchNextPage: vi.fn(),
		hasNextPage: false,
	})

	mockUseOrderQuery.mockReturnValue({
		data: defaultOrderQueryData,
		isLoading: false,
		isError: false,
	})

	mockUsePatchOrderStatusMutation.mockReturnValue({
		mutate: mockPatchOrderStatus,
		isPending: false,
	})
	mockUsePatchOrderBulk.mockReturnValue({
		mutate: mockPatchOrderBulk,
	})
})

describe("OrdersPage", () => {
	test("renders default title and order card", async () => {
		renderWithRouter(<OrdersPage />)
		expect(await screen.findByText("All Orders")).toBeVisible()
		expect(await screen.findByText("Order #7")).toBeVisible()
	})

	test("renders searching title", async () => {
		mockUseOrderParams.mockReturnValueOnce({
			sortBy: {},
			status: { get: () => [] },
			searchName: { get: () => "alex" },
			getParams: () => ({ searchName: "alex" }),
		})

		renderWithRouter(<OrdersPage />)
		expect(await screen.findByText("Searching: alex")).toBeVisible()
	})

	test("fetches next page when chevron is clicked", async () => {
		const fetchNextPage = vi.fn()
		mockUseOrdersInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ orders: [defaultOrderSummary] }],
			},
			fetchNextPage,
			hasNextPage: true,
		})

		renderWithRouter(<OrdersPage />)
		await user.click(
			await screen.findByLabelText("ChevronDownIcon")
		)
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	test("updates the status of multiple selected orders", async () => {
		const secondOrder = makeOrderSummary({
			orderId: 8,
			status: "pending",
		})
		mockUseOrdersInfiniteQuery.mockReturnValue({
			data: {
				pages: [{ orders: [defaultOrderSummary, secondOrder] }],
			},
			fetchNextPage: vi.fn(),
			hasNextPage: false,
		})

		renderWithRouter(<OrdersPage />)
		const checkboxes = screen.getAllByRole("checkbox")
		await user.click(checkboxes[1])
		await user.click(checkboxes[2])
		await user.selectOptions(
			await screen.findByLabelText("Selected status"),
			"shipped"
		)
		await user.click(await screen.findByRole("button", {
			name: "Update selected",
		}))

		expect(mockPatchOrderBulk).toHaveBeenCalledWith({
			orderIds: [7, 8],
			status: "shipped",
		})
	})
})

describe("OrderCard", () => {
	test("opens modal on click", async () => {
		renderWithRouter(<OrdersPage />)

		await user.click(await screen.findByText("Order #7"))
		expect(await screen.findByText("Order Details")).toBeVisible()
	})
})

describe("OrderModal", () => {
	test("shows loading state", async () => {
		mockUseOrderQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<OrdersPage />)
		await user.click(await screen.findByText("Order #7"))
		expect(await screen.findByText("Loading...")).toBeVisible()
	})

	test("shows error state", async () => {
		mockUseOrderQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<OrdersPage />)
		await user.click(await screen.findByText("Order #7"))
		expect(await screen.findByText("Error loading order details"))
			.toBeVisible()
	})

	test("shows user name and email", async () => {
		renderWithRouter(<OrdersPage />)

		await user.click(await screen.findByText("Order #7"))
		expect(await screen.findByText("User Name: Alex")).toBeVisible()
		expect(await screen.findByText("User Email: alex@example.com"))
			.toBeVisible()
	})

	test("updates status when the select changes", async () => {
		renderWithRouter(<OrdersPage />)

		await user.click(await screen.findByText("Order #7"))
		await user.selectOptions(
			await screen.findByLabelText("Order status"),
			"shipped"
		)
		expect(mockPatchOrderStatus).toHaveBeenCalledWith({
			orderId: 7,
			status: "shipped",
		})
	})
})

describe("OrderItemCard", () => {
	test("navigates to product page when item is clicked", async () => {
		renderWithRouter(<OrdersPage />)

		await user.click(await screen.findByText("Order #7"))
		await user.click(
			await screen.findByRole("button", { name: /moon orb/i })
		)

		expect(await screen.findByTestId("location"))
			.toHaveTextContent("/product/moon-orb")
	})
})
