
import type { DateStr } from "@/utils/DateStr"
import { labelizeRecord } from "@/utils/funcs"
import type { 
    FieldDefs as QueryParamsFieldDefs, 
} from "@/hooks/QueryParams"
import { kind } from "@/hooks/QueryParams"

import type { SaleSummary } from "./index"


export type {
    Category,
    Rarity,
    Sort,
    AdminSort,
    Product,
    ProductSummary,
    ProductAnalytics,
    SearchParams,
    AdminSearchParams
}
export {
    categories,
    rarities,
    raritiesOrder,
    sort,
    adminSort,
    queryParamFields,
    adminQueryParamFields,
}

// Domain

type Product = {
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
}

type ProductSummary = {
    id: number
    saleID: number | null
    name: string
    slug: string
}

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
    discontinuedAt: DateStr | null
    createdAt: DateStr

    unitsSold: number,
    revenue: number,
    orderCount: number,
    refunds: number,
    revenueLost: number,
    averageRating: number,
    reviews: number,
} 


// Enum
const categories = {
    weapons: "weapons",
    armaments: "armaments",
    apparel: "apparel",
    accessories: "accessories",
    potions: "potions",
    artifacts: "artifacts",
} as const
type Category = typeof categories [keyof typeof categories ]

const rarities = {
    common: "common",
    uncommon: "uncommon",
    rare: "rare",
    epic: "epic",
    legendary: "legendary",
} as const
type Rarity = typeof rarities [keyof typeof rarities ]

const raritiesOrder = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
} as const

const sort  = {
    popularity: "popularity",
    price: "price",
    alphabet: "alphabet",
    newest: "newest",
    rarity: "rarity"
} as const 

type Sort = typeof sort [keyof typeof sort ]

const adminSort  = {
    price: "price",
    alphabet: "alphabet",
    newest: "newest",
    rarity: "rarity",
    quantitySold: "quantitySold",
    revenue: "revenue",
    orderCount: "orderCount",
    refunds: "refunds",
    revenueLost: "revenueLost",
    averageRating: "averageRating",
    reviews: "reviews",
    onSale: "onSale",
} as const  

type AdminSort = keyof typeof adminSort


// Hooks
const queryParamFields = {
    categories: {
        kind: kind.selectMultiple,
        label: "Category",
        options: categories,
        labels: labelizeRecord(categories),
    },
    rarities: {
        kind: kind.selectMultiple,
        label: "Rarity",
        options: rarities,
        labels: labelizeRecord(rarities),
    },
    sort: {
        kind: kind.selectOne,
        label: "sort By",
        defaultValue: sort.popularity,
        options: sort,
        labels: labelizeRecord(sort),
    },        
    isAscending: {
        kind: kind.boolean,
        label: "Ascending",
    },
    search: {
        kind: kind.text,
        label: "Search",
        placeholder: "Search products"
    },

} satisfies QueryParamsFieldDefs;

type SearchParams = {
    categories: Category[],
    rarities: Rarity[],
    sort: Sort,
    isAscending: boolean,
    search: string,
}

const adminQueryParamFields = {
    sort: {
        kind: kind.selectOne,
        label: "Sort By",
        defaultValue: adminSort.newest,
        options: adminSort,
        labels: labelizeRecord(adminSort),
    },
    categories: {
        kind: kind.selectMultiple,
        label: 'Categories',
        options: categories,
        labels: labelizeRecord(categories),
    },
    rarities: {
        kind: kind.selectMultiple,
        label: 'Rarities',
        options: rarities,
        labels: labelizeRecord(rarities),
    },
    search: {
        kind: kind.text,
        label: "Search",
        placeholder: "Search"
    },

    isDiscontinued: {
        kind: kind.boolean,
        label: "Discontinued",
    },
    isAscending: {
        kind: kind.boolean,
        label: "Ascending",
    },
} satisfies QueryParamsFieldDefs;

type AdminSearchParams = {
    sort: AdminSort,
    categories: Category[],
    rarities: Rarity[],
    search: string,
    isDiscontinued: boolean,
    isAscending: boolean,
};





