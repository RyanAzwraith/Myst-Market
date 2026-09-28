import { 
    kind as formInputsKind, 
    type FieldDefs as FormInputsFieldDefs
} from "@/hooks/FormInputs";
import { 
    kind as queryParamsKind, 
    type FieldDefs as QueryParamsFieldDefs
} from "@/hooks/QueryParams";
import type { DateStr } from "@/utils/DateStr";
import { labelizeRecord } from "@/utils/funcs";

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
    registerFormFields,
    setPasswordFormFields,
    updateFormFields,
    adminSearchParams,
}

// Domain
type User = {
	id: number;
	email: string;
	name: string;
    isAdmin: boolean
}

type UserInput = {
    email: string;
    name: string;
}

type UserSummary = {
	email: string;
	name: string;
}

type UserDetail = {
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

// Hooks
const registerFormFields = {
    name: {
        kind: formInputsKind.text,
        label: "Name",
        placeholder: "Name",
        validate: (v) => !v?.trim() ? "Name required" : null
    },
    email: {
        kind: formInputsKind.email,
        label: "Email",
        placeholder: "Email",
    },
} satisfies FormInputsFieldDefs

const setPasswordFormFields = {
    password: {
        kind: formInputsKind.password,
        label: "Password",
        validate: (v) => !v ? "Password required" : null
    },
    rePassword: {
        kind: formInputsKind.password,
        label: "Re-enter Password",
        validate: (v) => !v ? "Re-enter Password required" : null
    }
} satisfies FormInputsFieldDefs

const updateFormFields = (user: User | null) => ({
    name: {
        kind: formInputsKind.text,
        label: "Name",
        placeholder: "Name",
        validate: (v) => !v?.trim() ? "Name required" : null,
        initial: user?.name
    },
    email: {
        kind: formInputsKind.email,
        label: "Email",
        placeholder: "Email",
        initial: user?.email
    }
} satisfies FormInputsFieldDefs)

const adminSearchParams = {
    registration: {
        kind: queryParamsKind.selectMultiple,
        label: "Registration Type",
        options: registration,
        labels: labelizeRecord(registration)
    },
    sortBy: {
        kind: queryParamsKind.selectOne,
        label: "sortBy",
        defaultValue: 'createdAt' as AdminSort,
        options: adminSort,
        labels: labelizeRecord(adminSort)
    },
    search: {
        kind: queryParamsKind.text,
        label: "Search",
        placeholder: "Search"
    },
    isAscending: {
        kind: queryParamsKind.boolean,
        label: "Ascending",
    },
} satisfies QueryParamsFieldDefs
