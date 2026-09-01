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
    itemResolutions: ItemResolution[]
    costAudCent: number
    createdAt: Date
    status: Status
}

type OrderSummary = {
    id: number
    createdAt: Date
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
    sortBy: AdminSort
    isAscending: boolean
}