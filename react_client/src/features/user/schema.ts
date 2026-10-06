import type { DateStr } from "@/utils/DateStr";

export type { 
    User,
    UserInput,
    UserSummary,
    UserDetail,
    UserAnalytics,
    AdminSort,
    Registration,
    AdminSearchParams,
}
export {
    adminSort,
    registration,
}

// Domain
type UserSummary = {
	email: string;
	name: string;
}

type User = UserSummary & {
	id: number;
	email: string;
	name: string;
    isAdmin: boolean
}

type UserInput = UserSummary & {
    email: string;
    name: string;
}

type UserDetail = UserSummary & {
    id: number
    name: string
    email: string
    isRegistered: boolean
}

type UserAnalytics = UserSummary & {
    id: number
    name: string
    email: string
    isRegistered: boolean
    createdAt: DateStr
    deletedAt: DateStr | null
    
    orderCount: number,
    spent: number,
    revenueLost: number,
    reviewCount: number,
}


// Enums

const adminSort  = {
    alphabet: "Alphabet",
    createdAt: "Date",
    orderCount: "Order Count",
    spent: "Spent",
    revenueLost: "Revenue Lost",
    reviewCount: "Review Count",
} as const

type AdminSort = keyof typeof adminSort

const registration  = {
    registered: "registered",
    guest: "guest",
    deleted: "deleted",
} as const

type Registration = keyof typeof registration

type AdminSearchParams = {
    isAscending: boolean,
    sortBy: AdminSort ,
    search: string,
    registration: Registration[],
}

