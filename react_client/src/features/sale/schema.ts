import type { DateStr } from '@/utils/DateStr'

export type {
    SaleSummary,
    Sale,   
    SaleAnalytics,

    AdminSort,
    Activation,

    AdminSearchParams,
}

export {
    adminSort,
    activation,
}


// Domain
type Sale = {
    id: number
    name: string
    slug: string
    description: string
    discountPerc: number
    startAt: DateStr
    endAt: DateStr
}

type SaleSummary = {
    name: string
    slug: string
    discountPerc: number
}

type SaleAnalytics = {
    id: number,
    name: string,
    slug: string,
    description: string | null,
    startAt: DateStr,
    endAt: DateStr,

    discountPerc: number,
    revenue: number,
    orderCount: number,
    revenueLost: number,
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


// Hooks
type AdminSearchParams = {
    activation: Activation[],
    isAscending: boolean,
    sort: AdminSort,
    search: string,
}
