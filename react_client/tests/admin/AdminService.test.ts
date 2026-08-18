import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
	makeOrderUserResponse,
	makeProductAnalytics,
	makeSaleAnalytics,
	makeUserAnalytics,
	mockedAuthRequest,
	mockPaginatedResponse,
	mockShopFilters,
} from './AdminMock'
import { createWrapper } from '../utils'
import {
	useDeleteProductMutation,
	useDeleteSaleMutation,
	useOrderParams,
	useOrderQuery,
	useOrdersInfiniteQuery,
	usePatchOrderStatusMutation,
	usePatchProductMutation,
	usePatchSaleMutation,
	usePostProductMutation,
	usePostSaleMutation,
	useProductAnalyticsQuery,
	useProductParams,
	useProductsInfiniteQuery,
	useSaleAnalyticsQuery,
	useSaleParams,
	useSalesInfiniteQuery,
	useUserAnalyticsQuery,
	useUserParams,
	useUsersInfiniteQuery,
} from '@/features/admin/AdminService'

describe('useUserParams', () => {
	it('reads user filters from the admin URL', () => {
		const { wrapper } = createWrapper(
			'/admin/users?registration=guest,deleted&sortBy=spent&search=ann&isAscending=true'
		)
		const { result } = renderHook(() => useUserParams(), { wrapper })

		expect(result.current.registration.get()).toEqual(['guest', 'deleted'])
		expect(result.current.sortBy.get()).toBe('spent')
		expect(result.current.search.get()).toBe('ann')
		expect(result.current.isAscending.get()).toBe(true)
	})
})

describe('useUsersInfiniteQuery', () => {
	it('posts the first page and computes the next offset', async () => {
		const { wrapper } = createWrapper()
		mockPaginatedResponse({ users: [{ id: 1 }] }, true)
		mockPaginatedResponse({ users: [{ id: 2 }] }, false)

		const { result } = renderHook(
			() => useUsersInfiniteQuery(20, {
				registration: ['guest'],
				sortBy: 'createdAt',
			}),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/users/search',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					limit: 20,
					offset: 0,
					registration: ['guest'],
					sortBy: 'createdAt',
				}),
			})
		)
		expect(result.current.hasNextPage).toBe(true)
		await result.current.fetchNextPage()
		expect(mockedAuthRequest).toHaveBeenLastCalledWith(
			'/admin/users/search',
			expect.objectContaining({
				body: JSON.stringify({
					limit: 20,
					offset: 20,
					registration: ['guest'],
					sortBy: 'createdAt',
				}),
			})
		)
	})
})

describe('useUserAnalyticsQuery', () => {
	it('gets user analytics from the admin route', async () => {
		const { wrapper } = createWrapper()
		mockedAuthRequest.mockResolvedValueOnce({
			user: makeUserAnalytics({ id: 4 }),
		})

		const { result } = renderHook(() => useUserAnalyticsQuery(4), { wrapper })
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/users/4/analytics'
		)
	})
})

describe('useSaleParams', () => {
	it('reads sale activation and sorting filters', () => {
		const { wrapper } = createWrapper(
			'/admin/sales?activation=active,expired&sortBy=revenue'
		)
		const { result } = renderHook(() => useSaleParams(), { wrapper })

		expect(result.current.activation.get()).toEqual(['active', 'expired'])
		expect(result.current.sortBy.get()).toBe('revenue')
	})
})

describe('useSalesInfiniteQuery', () => {
	it('posts sale search parameters', async () => {
		const { wrapper } = createWrapper()
		mockPaginatedResponse({ sales: [] })

		const { result } = renderHook(
			() => useSalesInfiniteQuery(10, {
				activation: ['active'],
				search: 'summer',
			}),
			{ wrapper }
		)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/sales/search',
			expect.objectContaining({
				body: JSON.stringify({
					limit: 10,
					offset: 0,
					activation: ['active'],
					search: 'summer',
				}),
			})
		)
	})
})

describe('useSaleAnalyticsQuery', () => {
	it('gets sale analytics from the admin route', async () => {
		const { wrapper } = createWrapper()
		mockedAuthRequest.mockResolvedValueOnce({
			sale: makeSaleAnalytics(),
		})

		const { result } = renderHook(() => useSaleAnalyticsQuery(7), { wrapper })
		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/sales/7/analytics'
		)
	})
})

describe('usePostSaleMutation', () => {
	it('creates a sale and invalidates sale searches', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({ id: 1 } as never)

		const { result } = renderHook(() => usePostSaleMutation(), { wrapper })
		await result.current.mutateAsync({
			name: 'Summer', slug: 'summer', description: 'Sale',
			discountPercent: 10,
			startAt: new Date('2026-01-01'),
			endAt: new Date('2026-01-10'),
		})

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/sales',
			expect.objectContaining({ method: 'POST' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'sales'],
		})
	})

})

describe('usePatchSaleMutation', () => {
	it('patches a sale and invalidates its analytics and list', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(() => usePatchSaleMutation(), { wrapper })
		await result.current.mutateAsync({
			saleId: 2,
			data: {
				name: null,
				slug: null,
				description: null,
				startAt: null,
				endAt: null,
				discountPercent: null,
			},
		})

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/sales/2',
			expect.objectContaining({ method: 'PATCH' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'sale-analytics', 2],
		})
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'sales'],
		})
	})

})

describe('useDeleteSaleMutation', () => {
	it('deletes a sale and invalidates sale searches', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(() => useDeleteSaleMutation(), { wrapper })
		await result.current.mutateAsync(3)

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/sales/3',
			expect.objectContaining({ method: 'DELETE' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'sales'],
		})
	})
})

describe('useProductParams', () => {
	it('builds category and rarity filter options from shop queries', () => {
		mockShopFilters(['amulet'], ['rare'])
		const { wrapper } = createWrapper()
		const { result } = renderHook(() => useProductParams(), { wrapper })

		expect(result.current.categories.options).toEqual({ Amulet: 'amulet' })
		expect(result.current.rarities.options).toEqual({ Rare: 'rare' })
	})
})

describe('useProductsInfiniteQuery', () => {
	it('posts product filters', async () => {
		const { wrapper } = createWrapper()
		mockPaginatedResponse({ products: [] })

		const { result } = renderHook(
			() => useProductsInfiniteQuery(15, {
				categories: ['amulet'],
				rarities: ['rare'],
				isDiscontinued: true,
			}),
			{ wrapper }
		)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/products/search',
			expect.objectContaining({
				body: JSON.stringify({
					limit: 15,
					offset: 0,
					categories: ['amulet'],
					rarities: ['rare'],
					isDiscontinued: true,
				}),
			})
		)
	})
})

describe('useProductAnalyticsQuery', () => {
	it('gets product analytics from the admin route', async () => {
		const { wrapper } = createWrapper()
		mockedAuthRequest.mockResolvedValueOnce({
			product: makeProductAnalytics(),
		})

		const { result } = renderHook(() => useProductAnalyticsQuery(8), { wrapper })
		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/products/8/analytics'
		)
	})
})

describe('usePostProductMutation', () => {
	it('creates a product and invalidates product searches', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(() => usePostProductMutation(), { wrapper })
		await result.current.mutateAsync({
			name: 'Orb', categoryName: 'magic', rarityName: 'rare',
			priceAudCent: 100, slug: 'orb', description: 'An orb', stock: 2,
		})

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/products',
			expect.objectContaining({ method: 'POST' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'products'],
		})
	})

})

describe('usePatchProductMutation', () => {
	it('patches a product and invalidates its list', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(() => usePatchProductMutation(), { wrapper })
		await result.current.mutateAsync({
			productId: 9,
			data: {
				name: null,
				categoryName: null,
				rarityName: null,
				priceAudCent: null,
				slug: null,
				description: null,
				stock: 5,
			},
		})

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/products/9',
			expect.objectContaining({ method: 'PATCH' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'products'],
		})
	})

})

describe('useDeleteProductMutation', () => {
	it('deletes a product and invalidates product searches', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(() => useDeleteProductMutation(), { wrapper })
		await result.current.mutateAsync(10)

		expect(mockedAuthRequest).toHaveBeenCalledWith('/admin/products/10',
			expect.objectContaining({ method: 'DELETE' }))
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'products'],
		})
	})
})

describe('useOrderParams', () => {
	it('reads order status, search, and sort filters', () => {
		const { wrapper } = createWrapper(
			'/admin/orders?status=shipped,delivered&searchName=ava&sortBy=cost'
		)
		const { result } = renderHook(() => useOrderParams(), { wrapper })

		expect(result.current.status.get()).toEqual(['shipped', 'delivered'])
		expect(result.current.searchName.get()).toBe('ava')
		expect(result.current.sortBy.get()).toBe('cost')
	})
})

describe('useOrdersInfiniteQuery', () => {
	it('posts order search parameters', async () => {
		const { wrapper } = createWrapper()
		mockPaginatedResponse({ orders: [] })

		const { result } = renderHook(
			() => useOrdersInfiniteQuery(25, {
				status: ['shipped'],
				searchName: 'ava',
			}),
			{ wrapper }
		)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/orders/search',
			expect.objectContaining({
				body: JSON.stringify({
					limit: 25,
					offset: 0,
					status: ['shipped'],
					searchName: 'ava',
				}),
			})
		)
	})
})

describe('useOrderQuery', () => {
	it('gets order details and its user', async () => {
		const { wrapper } = createWrapper()
		mockedAuthRequest.mockResolvedValueOnce(makeOrderUserResponse())

		const { result } = renderHook(() => useOrderQuery(11), { wrapper })
		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/orders/11/user'
		)
	})
})

describe('usePatchOrderStatusMutation', () => {
	it('patches the selected status and invalidates order queries', async () => {
		const { client, wrapper } = createWrapper()
		const invalidate = vi.spyOn(client, 'invalidateQueries')
		mockedAuthRequest.mockResolvedValueOnce({} as never)

		const { result } = renderHook(
			() => usePatchOrderStatusMutation(),
			{ wrapper }
		)
		await result.current.mutateAsync({ orderId: 12, status: 'shipped' })

		expect(mockedAuthRequest).toHaveBeenCalledWith(
			'/admin/orders/12/status',
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({ status: 'shipped' }),
			})
		)
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'orders'],
		})
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: ['admin', 'order', 12],
		})
	})
})
