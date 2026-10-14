import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createWrapper, resetAuthState } from "../../utils"
import {
    orderFactory,
    orderSummaryFactory,
} from "../../../mock_data/order"
import { reviewFactory } from "../../../mock_data/review"
import {
    userAnalyticsFactory,
    userFactory,
} from "../../../mock_data/user"
import { server } from "@/core"
import type { AdminSearchParams } from "@/features/user/schema"
import {
    useAdminSearchQuery,
    useAnalyticsQuery,
    useCreateMutation,
    useDeleteMutation,
    useOrderQuery,
    useOrdersQuery,
    usePatchMutation,
    usePatchPasswordMutation,
    useReviewsQuery,
    useSendPasswordEmailMutation,
} from "@/features/user/service"
import { useAuthState } from "@/features/auth/state"

describe("useAdminSearchQuery intimacy: medium", () => {
    it("functionality flattens users from the first page", async () => {
        const users = [
            userAnalyticsFactory({ id: 1 }),
            userAnalyticsFactory({ id: 2 }),
        ]
        const searchParams: AdminSearchParams = {
            registration: ["registered"],
            sortBy: "createdAt",
            search: "customer",
            isAscending: true,
        }
        const adminSearch = vi.spyOn(server.users, "adminSearch")
            .mockResolvedValue({ users, hasMore: false })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useAdminSearchQuery(10, searchParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.users)
            .toEqual(users))
        expect(adminSearch).toHaveBeenCalledWith({
            searchParams,
            limit: 10,
            offset: 0,
        })
    })

    it("fetches and appends the next page when more users exist", async () => {
        const firstPage = [userAnalyticsFactory({ id: 1 })]
        const secondPage = [userAnalyticsFactory({ id: 2 })]
        const adminSearch = vi.spyOn(server.users, "adminSearch")
            .mockResolvedValueOnce({
                users: firstPage,
                hasMore: true,
            })
            .mockResolvedValueOnce({
                users: secondPage,
                hasMore: false,
            })
        const { wrapper } = createWrapper()

        const { result } = renderHook(
            () => useAdminSearchQuery(1, null),
            { wrapper },
        )

        await waitFor(() => expect(result.current.data?.users)
            .toEqual(firstPage))
        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => expect(result.current.data?.users)
            .toEqual([...firstPage, ...secondPage]))
        expect(adminSearch).toHaveBeenLastCalledWith({
            searchParams: null,
            limit: 1,
            offset: 1,
        })
    })
})

describe("useAnalyticsQuery intimacy: medium", () => {
    it("functionality selects the requested user analytics", async () => {
        const user = userAnalyticsFactory({ id: 7 })
        const getAnalytics = vi.spyOn(server.user, "getAnalytics")
            .mockResolvedValue({ user })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAnalyticsQuery(7), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(user))
        expect(getAnalytics).toHaveBeenCalledWith(7)
    })
})

describe("useReviewsQuery intimacy: medium", () => {
    it("functionality selects the returned reviews", async () => {
        const reviews = [
            reviewFactory({ id: 1 }),
            reviewFactory({ id: 2 }),
        ]
        const getReviews = vi.spyOn(server.user, "getReviews")
            .mockResolvedValue({ reviews })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useReviewsQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(reviews))
        expect(getReviews).toHaveBeenCalledOnce()
    })
})

describe("useOrderQuery intimacy: medium", () => {
    it("functionality selects the requested order", async () => {
        const order = orderFactory({ id: 14 })
        const getOrder = vi.spyOn(server.user, "getOrder")
            .mockResolvedValue({ order })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useOrderQuery(14), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(order))
        expect(getOrder).toHaveBeenCalledWith(14)
    })
})

describe("useOrdersQuery intimacy: medium", () => {
    it("functionality selects the returned order summaries", async () => {
        const orders = [
            orderSummaryFactory({ id: 1 }),
            orderSummaryFactory({ id: 2 }),
        ]
        const getOrders = vi.spyOn(server.user, "getOrders")
            .mockResolvedValue({ orders })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useOrdersQuery(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.data).toEqual(orders))
        expect(getOrders).toHaveBeenCalledOnce()
    })
})

describe("useCreateMutation intimacy: medium", () => {
    it("functionality creates a user and calls onSuccess", async () => {
        const userInput = {
            name: "New Customer",
            email: "new@example.com",
        }
        const create = vi.spyOn(server.user, "create")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCreateMutation({ onSuccess }),
            { wrapper },
        )

        await result.current.mutateAsync(userInput)

        expect(create).toHaveBeenCalledWith({ userInput })
        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("passes server errors to onError", async () => {
        const error = new Error("Unable to create user")
        const onError = vi.fn()
        vi.spyOn(server.user, "create").mockRejectedValue(error)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCreateMutation({ onError }),
            { wrapper },
        )

        await expect(result.current.mutateAsync({
            name: "New Customer",
            email: "new@example.com",
        })).rejects.toBe(error)

        expect(onError).toHaveBeenCalledWith(error)
    })
})

describe("useSendPasswordEmailMutation intimacy: medium", () => {
    it("functionality sends a password email and calls onSuccess",
        async () => {
            const passwordEmail = vi.spyOn(server.user, "passwordEmail")
                .mockResolvedValue(undefined)
            const onSuccess = vi.fn()
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useSendPasswordEmailMutation({ onSuccess }),
                { wrapper },
            )

            await result.current.mutateAsync()

            expect(passwordEmail).toHaveBeenCalledOnce()
            expect(onSuccess).toHaveBeenCalledOnce()
        },
    )
})

describe("usePatchMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality patches the user and updates auth state", async () => {
        const currentUser = userFactory({ name: "Current Name" })
        const updatedUser = userFactory({
            id: currentUser.id,
            name: "Updated Name",
            email: currentUser.email,
        })
        useAuthState.getState().setUser(currentUser)
        const patch = vi.spyOn(server.user, "patch")
            .mockResolvedValue({ user: updatedUser })
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => usePatchMutation({ onSuccess }),
            { wrapper },
        )
        const userInput = { name: "Updated Name" }

        await result.current.mutateAsync(userInput)

        expect(patch).toHaveBeenCalledWith({ userInput })
        expect(useAuthState.getState().user).toBe(updatedUser)
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("usePatchPasswordMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality changes the password and refreshes auth state",
        async () => {
            const user = userFactory({ email: "updated@example.com" })
            const patchPassword = vi.spyOn(server.user, "patchPassword")
                .mockResolvedValue({
                    accessToken: "updated-token",
                    user,
                })
            const onSuccess = vi.fn()
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => usePatchPasswordMutation({ onSuccess }),
                { wrapper },
            )

            await result.current.mutateAsync("new-password")

            expect(patchPassword).toHaveBeenCalledWith({
                password: "new-password",
            })
            expect(useAuthState.getState().accessToken)
                .toBe("updated-token")
            expect(useAuthState.getState().user).toBe(user)
            expect(onSuccess).toHaveBeenCalledOnce()
        },
    )
})

describe("useDeleteMutation intimacy: medium", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality deletes the account and clears auth state", async () => {
        const user = userFactory()
        useAuthState.getState().login("active-token", user)
        const remove = vi.spyOn(server.user, "delete")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useDeleteMutation({ onSuccess }),
            { wrapper },
        )

        await result.current.mutateAsync()

        expect(remove).toHaveBeenCalledOnce()
        expect(useAuthState.getState().accessToken).toBeNull()
        expect(useAuthState.getState().user).toBeNull()
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})
