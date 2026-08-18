import { beforeEach, describe, expect, test, vi } from "vitest"
import { screen } from "@testing-library/react"
import { userEvent, type UserEvent } from "@testing-library/user-event"

import { renderWithRouter, resetAuthState } from "../utils"
import { makeUserAnalytics } from "./AdminMock"
import { UsersPage } from "@/features/admin/UsersPage"

const userMocks = vi.hoisted(() => ({
	mockUseUserParams: vi.fn(),
	mockUseUsersInfiniteQuery: vi.fn(),
	mockUseUserAnalyticsQuery: vi.fn(),
}))

vi.mock("@/features/admin/AdminService", () => ({
	useUserParams: userMocks.mockUseUserParams,
	useUsersInfiniteQuery: userMocks.mockUseUsersInfiniteQuery,
	useUserAnalyticsQuery: userMocks.mockUseUserAnalyticsQuery,
}))

const {
	mockUseUserAnalyticsQuery,
	mockUseUserParams,
	mockUseUsersInfiniteQuery,
} = userMocks

let user: UserEvent

const defaultUser = makeUserAnalytics({
	id: 7,
	name: "Ada Lovelace",
	email: "ada@example.com",
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

	mockUseUserParams.mockReturnValue({
		getParams: () => ({}),
		isAscending: makeFilter(false),
		registration: makeFilter([], { registered: "Registered" }),
		search: makeFilter(""),
		sortBy: makeFilter("createdAt", { createdAt: "Date" }),
	})

	mockUseUsersInfiniteQuery.mockReturnValue({
		data: {
			pages: [{ users: [defaultUser] }],
		},
		fetchNextPage: vi.fn(),
		hasNextPage: false,
	})

	mockUseUserAnalyticsQuery.mockReturnValue({
		data: { user: defaultUser },
		isLoading: false,
		isError: false,
	})
})

describe("UsersPage", () => {
	test("renders the default title and user card", async () => {
		renderWithRouter(<UsersPage />)

		expect(await screen.findByText("All Users")).toBeVisible()
		expect(await screen.findByText("Ada Lovelace")).toBeVisible()
		expect(await screen.findByText("ada@example.com")).toBeVisible()
	})

	test("renders the searching title", async () => {
		mockUseUserParams.mockReturnValueOnce({
			getParams: () => ({ search: "ada" }),
			isAscending: makeFilter(false),
			registration: makeFilter([], {}),
			search: makeFilter("ada"),
			sortBy: makeFilter("createdAt", {}),
		})

		renderWithRouter(<UsersPage />)

		expect(await screen.findByText("Searching: ada")).toBeVisible()
	})

	test("renders the registration title", async () => {
		mockUseUserParams.mockReturnValueOnce({
			getParams: () => ({ registration: ["registered"] }),
			isAscending: makeFilter(false),
			registration: makeFilter(["Registered"]),
			search: makeFilter(""),
			sortBy: makeFilter("createdAt", {}),
		})

		renderWithRouter(<UsersPage />)

		expect(await screen.findByRole("heading", {
			name: "Registered",
		})).toBeVisible()
	})

	test("fetches the next page when the chevron is clicked", async () => {
		const fetchNextPage = vi.fn()
		mockUseUsersInfiniteQuery.mockReturnValueOnce({
			data: {
				pages: [{ users: [defaultUser] }],
			},
			fetchNextPage,
			hasNextPage: true,
		})

		renderWithRouter(<UsersPage />)
		await user.click(await screen.findByLabelText("ChevronDownIcon"))

		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})
})

describe("UserModal", () => {
	test("opens the user details modal", async () => {
		renderWithRouter(<UsersPage />)

		await user.click(await screen.findByText("Ada Lovelace"))

		expect(await screen.findByText("User Details")).toBeVisible()
		expect(await screen.findByText("Name: Ada Lovelace")).toBeVisible()
		expect(mockUseUserAnalyticsQuery).toHaveBeenCalledWith(7)
	})

	test("shows the loading state", async () => {
		mockUseUserAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: true,
			isError: false,
		})

		renderWithRouter(<UsersPage />)
		await user.click(await screen.findByText("Ada Lovelace"))

		expect(await screen.findByText("Loading...")).toBeVisible()
	})

	test("shows the error state", async () => {
		mockUseUserAnalyticsQuery.mockReturnValueOnce({
			data: null,
			isLoading: false,
			isError: true,
		})

		renderWithRouter(<UsersPage />)
		await user.click(await screen.findByText("Ada Lovelace"))

		expect(await screen.findByText("Error loading user details"))
			.toBeVisible()
	})
})
