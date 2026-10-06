import type { DateStr } from '@/utils/DateStr'

export type {
    SaleSummary,
    Sale,   
    SaleAnalytics,
    AdminSearchParams,

    AdminSort,
    Activation,
}

export {
    adminSort,
    activation,
}


// Domain
type SaleSummary = {
    name: string
    slug: string
    discountPerc: number
}

type Sale = 
    SaleSummary & {
    id: number
    description: string
    startAt: DateStr
    endAt: DateStr
}

type SaleAnalytics = 
    Sale & {
    revenue: number,
    orderCount: number,
    revenueLost: number,
}

type AdminSearchParams = {
    activation: Activation[],
    isAscending: boolean,
    sort: AdminSort,
    search: string,
}

// Enums
const adminSort  = {
    startAt: "startAt",
    endAt: "endAt",
    discountPerc: "discountPerc",
    duration: "duration",
    revenue: "revenue",
    orderCount: "orderCount",
    revenueLost: "revenueLost",
} as const

type AdminSort = keyof typeof adminSort

const activation = {
    active: "active",
    upcoming: "upcoming",
    expired: "expired",
} as const

type Activation = keyof typeof activation




