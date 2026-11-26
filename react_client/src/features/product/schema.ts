
import type { DateStr } from "@/utils/DateStr"

import type { SaleSummary } from "./index"


export type {
    Category,
    Rarity,
    Sort,
    AdminSort,
    Product,
    ProductSummary,
    ProductAnalytics,
    ProductFields,
    SearchParams,
    AdminSearchParams
    
}
export {
    categories,
    rarities,
    raritiesOrder,
    sort,
    adminSort,
}


// Domain
type ProductFields = { 
    name: string
    categoryName: string
    rarityName: string
    priceAudCent: number
    slug: string
    description: string
    stock: number
}

type Product = ProductFields & {
    id: number
    discountedPrice: number | null
    sale: SaleSummary | null
}

type ProductSummary = {
    id: number
    saleID: number | null
    name: string
    slug: string
}

type ProductAnalytics = Product & {
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

type SearchParams = {
    categories: Category[],
    rarities: Rarity[],
    sort: Sort,
    isAscending: boolean,
    search: string,
}

type AdminSearchParams = {
    sort: AdminSort,
    categories: Category[],
    rarities: Rarity[],
    search: string,
    isDiscontinued: boolean,
    isAscending: boolean,
};

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

type AdminSort = typeof adminSort [keyof typeof adminSort ]







