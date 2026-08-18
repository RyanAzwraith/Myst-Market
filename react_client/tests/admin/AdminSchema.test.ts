import { describe, expect, it } from 'vitest'

import {
	OrderSortBy,
	OrderStatus,
	ProductSortBy,
	Registration,
	SaleActivation,
	SaleSortBy,
	UserSortBy,
} from '@/features/admin/AdminSchema'

describe('UserSortBy', () => {
	it('contains the supported user sort keys and labels', () => {
		expect(UserSortBy).toEqual({
			alphabet: 'Alphabet',
			createdAt: 'Date',
			orderCount: 'Order Count',
			spent: 'Spent',
			revenueLost: 'Revenue Lost',
			reviewCount: 'Review Count',
		})
	})
})

describe('Registration', () => {
	it('contains the supported registration filters', () => {
		expect(Registration).toEqual({
			registered: 'registered',
			guest: 'guest',
			deleted: 'deleted',
		})
	})
})

describe('SaleSortBy', () => {
	it('contains the supported sale sort keys and labels', () => {
		expect(Object.keys(SaleSortBy)).toEqual([
			'startAt',
			'endAt',
			'discountPercent',
			'duration',
			'revenue',
			'orderCount',
			'revenueLost',
		])
	})
})

describe('SaleActivation', () => {
	it('contains the supported sale activation filters', () => {
		expect(SaleActivation).toEqual({
			active: 'Active',
			upcoming: 'Upcoming',
			expired: 'Expired',
		})
	})
})

describe('ProductSortBy', () => {
	it('contains the supported product sort keys', () => {
		expect(Object.keys(ProductSortBy)).toEqual([
			'price',
			'alphabet',
			'newest',
			'rarity',
			'quantitySold',
			'revenue',
			'orderCount',
			'refunds',
			'revenueLost',
			'averageRating',
			'reviews',
			'onSale',
		])
	})
})

describe('OrderSortBy', () => {
	it('uses API field names as order sort values', () => {
		expect(OrderSortBy).toEqual({
			createdAt: 'createdAt',
			cost: 'cost',
			status: 'status',
		})
	})
})

describe('OrderStatus', () => {
	it('contains every supported order status', () => {
		expect(OrderStatus).toEqual({
			pending: 'Pending',
			processing: 'Processing',
			shipped: 'Shipped',
			delivered: 'Delivered',
			cancelled: 'Cancelled',
			error: 'Error',
		})
	})
})
