import type { DateStr } from "@/utils/DateStr"

import type { ItemResolution } from "./index"

export type {
    Address,
    Order,
    OrderSummary,
    Status,
    AdminSort,
    AdminSearchParams
}
export {
    status,
    adminSort,
}

type Address = {
    countryCode: string
    postcode: string
    state: string
    city: string
    street: string
}

type Order = {
    userId: number
    addressString: string
    items: ItemResolution[]
    costAudCent: number
    createdAt: DateStr
    status: Status
}

type OrderSummary = {
    id: number
    createdAt: DateStr
    totalCent: number
    status: Status
}

// Enum
const status  = {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    error: 'error'
} as const  

type Status = keyof typeof status

const adminSort  = {
    createdAt: "createdAt",
    cost: "cost",
    status: "status",
}

type AdminSort = keyof typeof adminSort

// Hooks
type AdminSearchParams = {
    searchName: string
    status: Status[]
    sort: AdminSort
    isAscending: boolean
}