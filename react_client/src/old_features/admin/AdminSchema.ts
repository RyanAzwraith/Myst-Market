
import {
    OrderStatus,
} from '@/features/checkout/checkoutSchemas';
import type { 
    ItemResolution,
    ProductSummary,
    OrderDetail,
    OrderSummary,
    OrderStatusType,
} from '@/features/checkout/checkoutSchemas';
import type { 
    ProductDetail,
    SaleSummary,
} from '@/features/shop/shopSchemas';

type UserSummary = {
    id: number
    name: string
    email: string
    isRegistered: boolean
}

type UserAnalytics = {
    id: number
    name: string
    email: string
    isRegistered: boolean
    createdAt: Date
    deletedAt: Date | null
    
    orderCount: number,
    spent: number,
    revenueLost: number,
    reviewCount: number,
}

const UserSortBy  = {
    alphabet: "Alphabet",
    createdAt: "Date",
    orderCount: "Order Count",
    spent: "Spent",
    revenueLost: "Revenue Lost",
    reviewCount: "Review Count",
} as const

type UserSortByType = keyof typeof UserSortBy

const Registration  = {
    registered: "registered",
    guest: "guest",
    deleted: "deleted",
} as const

type RegistrationType = keyof typeof Registration

type SaleAnalytics = {
    id: number,
    name: string,
    slug: string,
    description: string | null,
    startAt: Date,
    endAt: Date,
    discountPercent: number,
    revenue: number,
    orderCount: number,
    revenueLost: number,
}

const SaleSortBy  = {
    startAt: "Start At",
    endAt: "End At",
    discountPercent: "Discount Percent",
    duration: "Duration",
    revenue: "Revenue",
    orderCount: "Order Count",
    revenueLost: "Revenue Lost",
} as const

type SaleSortByType = keyof typeof SaleSortBy

const SaleActivation = {
    active: "Active",
    upcoming: "Upcoming",
    expired: "Expired",
} as const

type SaleActivationType = keyof typeof SaleActivation

type ProductAnalytics = {
    id: number
    name: string
    categoryName: string
    rarityName: string
    priceAudCent: number
    slug: string
    description: string
    stock:number
    discountedPrice: number | null
    sale: SaleSummary | null
    discontinuedAt: Date | null
    createdAt: Date

    unitsSold: number,
    revenue: number,
    orderCount: number,
    refunds: number,
    revenueLost: number,
    averageRating: number,
    reviews: number,
} 

type PerformanceAnalytics = {
    periodDays: number
    revenue: number
    orders: number
    newCustomers: number
    revenueLost: number
    previousRevenue: number
    previousOrders: number
    previousNewCustomers: number
    previousRevenueLost: number
}

type AttentionAnalytics = {
    pendingOrders: number
    outOfStockProducts: number
    salesEnding: number
}

type GraphPoint = {
    month: string
    revenue: number
    orders: number
}

type GraphAnalytics = {
    points: GraphPoint[]
}

const ProductSortBy  = {
    price: "Price",
    alphabet: "Alphabet",
    newest: "Newest",
    rarity: "Rarity",
    quantitySold: "Quantity Sold",
    revenue: "Revenue",
    orderCount: "Order Count",
    refunds: "Refunds",
    revenueLost: "Revenue Lost",
    averageRating: "Average Rating",
    reviews: "Reviews",
    onSale: "On Sale",
} as const  

type ProductSortByType = keyof typeof ProductSortBy

const OrderSortBy  = {
    createdAt: "createdAt",
    cost: "cost",
    status: "status",
} as const 

type OrderSortByType = keyof typeof OrderSortBy

// Routes
// GET /admin/users/:id/analytics
// POST /admin/users/search

// GET /admin/sales/:id/analytics
// POST /admin/sales/search
// PATCH /admin/sales/:id
// PATCH /admin/sales
// POST /admin/sales
// DELETE /admin/sales/:id

// GET /admin/products/:id/analytics
// POST /admin/products/search
// POST /admin/products
// PATCH /admin/products/:id
// PATCH /admin/products
// DELETE /admin/products/:id

// GET /admin/orders/:orderId/user
// POST /admin/orders/search
// PATCH /admin/orders/:orderId/status
// PATCH /admin/orders/status

// GET /admin/performance
// GET /admin/attention
// GET /admin/graph

// User
type GetUserAnalyticsResponse = {
    user: UserAnalytics
}

type PostUserSearchRequest = {
    limit?: number | null
    offset?: number | null
    isAscending?: boolean | null,
    sortBy?: UserSortByType | null,
    search?: string | null,
    registration?: RegistrationType[] | null,
}

type PostUserSearchResponse = {
    users: UserAnalytics[]
    hasMore: boolean
}

// Sale
type GetSaleAnalyticsResponse = {
    sale: SaleAnalytics
}

type PostSaleSearchRequest = {
    limit?: number | null
    offset?: number | null
    activation?: SaleActivationType[] | null,
    isAscending?: boolean | null,
    sortBy?: SaleSortByType | null,
    search?: string | null,
}

type PostSaleSearchResponse = {
    sales: SaleAnalytics[]
    hasMore: boolean
}

type PatchSaleRequest = {
    name: string | null
    slug: string | null
    description: string | null
    startAt: Date | null
    endAt: Date | null
    discountPercent: number | null
}

type PatchSaleBulkRequest = {
    saleIds: number[]
    startAt: Date | null
    endAt: Date | null
    discountPercent: number | null
}

type PostSaleRequest = {
    name: string
    slug: string
    description: string
    discountPercent: number
    startAt: Date
    endAt: Date
}

// Product
type GetProductAnalyticsResponse = {
    product: ProductAnalytics
}

type PostProductSearchRequest = {
    limit?: number | null
    offset?: number | null
    categories?: string[] | null,
    rarities?: string[] | null,
    isAscending?: boolean | null,
    sortBy?: ProductSortByType | null,
    search?: string | null,
    isDiscontinued?: boolean | null,
}

type PostProductSearchResponse = {
    products: ProductAnalytics[]
    hasMore: boolean
}

type PatchProductRequest = {
    name: string | null
    categoryName: string | null
    rarityName: string | null
    priceAudCent: number | null
    slug: string | null
    description: string | null
    stock: number | null
}

type PatchProductBulkRequest = {
    productIds: number[]
    categoryName: string | null
    rarityName: string | null
    priceAudCent: number | null
    stock: number | null
}

type PostProductRequest = {
    name: string
    categoryName: string
    rarityName: string
    priceAudCent: number
    slug: string
    description: string
    stock: number
}


// Order 
type GetOrderUserResponse = {
    order: OrderDetail
    user: UserSummary
}

type PostOrdersSearchRequest = {
    limit?: number | null
    offset?: number | null
    searchName?: string | null
    status?: OrderStatusType[] | null
    sortBy?: OrderSortByType | null
    isAscending?: boolean | null
}

type PostOrdersSearchResponse = {
    orders: OrderSummary[]
    hasMore: boolean
}

type PatchOrderStatusRequest = {
    status?: OrderStatusType | null,
}

type PatchOrderBulkRequest = {
    orderIds: number[]
    status: OrderStatusType
}


export type {
    ProductSortByType,
    OrderStatusType,
    ProductSummary,
    ProductDetail,
    SaleSummary,
    ItemResolution,
    OrderDetail,
    OrderSummary,


    ProductAnalytics,
    PerformanceAnalytics,
    AttentionAnalytics,
    GraphAnalytics,
    GraphPoint,
    UserAnalytics,
    SaleAnalytics,
    UserSummary,
    
    UserSortByType,
    RegistrationType,
    SaleSortByType,
    OrderSortByType,

    GetUserAnalyticsResponse,
    PostUserSearchRequest,
    PostUserSearchResponse,

    SaleActivationType,
    GetSaleAnalyticsResponse,
    PostSaleSearchRequest,
    PostSaleSearchResponse,
    PatchSaleRequest,
    PatchSaleBulkRequest,
    PostSaleRequest,

    GetProductAnalyticsResponse,
    PostProductSearchRequest,
    PostProductSearchResponse,
    PostProductRequest,
    PatchProductRequest,
    PatchProductBulkRequest,

    GetOrderUserResponse,
    PostOrdersSearchRequest,
    PostOrdersSearchResponse,
    PatchOrderStatusRequest,
    PatchOrderBulkRequest,
}

export {
    
    UserSortBy,
    Registration,
    OrderSortBy,
    OrderStatus,
    SaleSortBy,
    SaleActivation,
    ProductSortBy,
}


