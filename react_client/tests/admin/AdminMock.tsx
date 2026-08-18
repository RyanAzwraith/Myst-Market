import React from 'react'
import { vi } from 'vitest'

import type {
    GetOrderUserResponse,
    ProductAnalytics,
    SaleAnalytics,
    UserAnalytics,
} from '@/features/admin/AdminSchema'
import type {
    ItemResolution,
    OrderDetail,
    OrderSummary,
} from '@/features/checkout/checkoutSchemas'
import type {
    ProductDetail,
    SaleSummary,
} from '@/features/shop/shopSchemas'

const mocks = vi.hoisted(() => ({
    mockedAuthRequest: vi.fn(),
    mockUseCategoriesQuery: vi.fn(),
    mockUseRaritiesQuery: vi.fn(),
    mockUseOrderParams: vi.fn(),
    mockUseOrdersInfiniteQuery: vi.fn(),
    mockUseOrderQuery: vi.fn(),
    mockUsePatchOrderStatusMutation: vi.fn(),
    mockPatchOrderStatus: vi.fn(),
    mockUsePerformanceQuery: vi.fn(),
    mockUseAttentionQuery: vi.fn(),
    mockUseGraphQuery: vi.fn(),
    mockUseRecentOrdersQuery: vi.fn(),
    mockUseTopProductsQuery: vi.fn(),
}))

export const {
    mockedAuthRequest,
    mockUseCategoriesQuery,
    mockUseRaritiesQuery,
    mockUseOrderParams,
    mockUseOrdersInfiniteQuery,
    mockUseOrderQuery,
    mockUsePatchOrderStatusMutation,
    mockPatchOrderStatus,
    mockUsePerformanceQuery,
    mockUseAttentionQuery,
    mockUseGraphQuery,
    mockUseRecentOrdersQuery,
    mockUseTopProductsQuery,
} = mocks

export const MockQueryParamsContainer = ({
    children,
}: { children: React.ReactNode }) => <div>{children}</div>
export const MockBooleanFilterField = () => <div>BooleanFilterField</div>
export const MockTextFilterField = () => <div>TextFilterField</div>
export const MockSelectMultipleFilterField = () => (
    <div>SelectMultipleFilterField</div>
)
export const MockSelectOneFilterField = () => <div>SelectOneFilterField</div>
export const MockImageComponent = ({ altText }: { altText: string }) => (
    <img alt={altText} />
)

vi.mock('@/shared/QueryParamsComponent', () => ({
    QueryParamsContainer: MockQueryParamsContainer,
    BooleanFilterField: MockBooleanFilterField,
    TextFilterField: MockTextFilterField,
    SelectMultipleFilterField: MockSelectMultipleFilterField,
    SelectOneFilterField: MockSelectOneFilterField,
}))

vi.mock('@/shared/ImageComponent', () => ({
    ImageComponent: MockImageComponent,
}))

vi.mock('@/api', () => ({
    authRequest: mockedAuthRequest,
}))

vi.mock('@/features/shop/shopService', () => ({
    useCategoriesQuery: mockUseCategoriesQuery,
    useRaritiesQuery: mockUseRaritiesQuery,
}))

function makeUserAnalytics(
    overrides: Partial<UserAnalytics> = {}
): UserAnalytics {
    return {
        id: 1,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        isRegistered: true,
        createdAt: new Date('2026-01-01'),
        deletedAt: null,
        orderCount: 2,
        spent: 2500,
        revenueLost: 0,
        reviewCount: 1,
        ...overrides,
    }
}

function makeSaleAnalytics(
    overrides: Partial<SaleAnalytics> = {}
): SaleAnalytics {
    return {
        id: 7,
        name: 'Moon Sale',
        slug: 'moon-sale',
        description: 'A sample sale.',
        startAt: new Date('2026-01-01T00:00:00.000Z'),
        endAt: new Date('2026-12-31T23:59:59.000Z'),
        discountPercent: 10,
        revenue: 5000,
        orderCount: 4,
        revenueLost: 0,
        ...overrides,
    }
}

function makeProductDetail(
    overrides: Partial<ProductDetail> = {}
): ProductDetail {
    return {
        id: 1,
        name: 'Moon Orb',
        categoryName: 'magic',
        rarityName: 'rare',
        priceAudCent: 1500,
        slug: 'moon-orb',
        description: 'A sample product.',
        stock: 5,
        discountedPrice: null,
        sale: null,
        ...overrides,
    }
}

function makeProductAnalytics(
    overrides: Partial<ProductAnalytics> = {}
): ProductAnalytics {
    return {
        ...makeProductDetail(),
        discontinuedAt: null,
        createdAt: new Date('2026-01-01'),
        unitsSold: 3,
        revenue: 4500,
        orderCount: 2,
        refunds: 0,
        revenueLost: 0,
        averageRating: 4.5,
        reviews: 2,
        ...overrides,
    }
}

function makeSaleSummary(
    overrides: Partial<SaleSummary> = {}
): SaleSummary {
    return {
        name: 'Moon Sale',
        slug: 'moon-sale',
        discountPercent: 10,
        ...overrides,
    }
}

function makeItemResolution(
    overrides: Partial<ItemResolution> = {}
): ItemResolution {
    return {
        productSummary: {
            id: 1,
            name: 'Moon Orb',
            slug: 'moon-orb',
        },
        quantity: 1,
        unitPriceCent: 1500,
        lineTotalCent: 1500,
        onSale: false,
        ...overrides,
    }
}

function makeOrderDetail(
    overrides: Partial<OrderDetail> = {}
): OrderDetail {
    return {
        userId: 1,
        addressString: '1 Moon Street, Sydney',
        itemResolutions: [makeItemResolution()],
        costAudCent: 1500,
        createdAt: new Date('2026-01-01'),
        status: 'pending',
        ...overrides,
    }
}

function makeOrderSummary(
    overrides: Partial<OrderSummary> = {}
): OrderSummary {
    return {
        orderId: 1,
        createdAt: new Date('2026-01-01'),
        totalCent: 1500,
        status: 'pending',
        ...overrides,
    }
}

function makeOrderUserResponse(
    overrides: Partial<GetOrderUserResponse> = {}
): GetOrderUserResponse {
    return {
        order: makeOrderDetail(),
        user: {
            id: 1,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            isRegistered: true,
        },
        ...overrides,
    }
}

function mockPaginatedResponse<T>(value: T, hasMore = false) {
    mockedAuthRequest.mockResolvedValueOnce({
        ...value,
        hasMore,
    })
}

function mockShopFilters(
    categories: string[] = ['magic'],
    rarities: string[] = ['rare']
) {
    mockUseCategoriesQuery.mockReturnValue({ data: categories })
    mockUseRaritiesQuery.mockReturnValue({ data: rarities })
}

export {
    makeItemResolution,
    makeOrderDetail,
    makeOrderSummary,
    makeOrderUserResponse,
    makeProductAnalytics,
    makeProductDetail,
    makeSaleAnalytics,
    makeSaleSummary,
    makeUserAnalytics,
    mockPaginatedResponse,
    mockShopFilters,
}
