
type SaleSummary = {
    name: string,
    slug: string
    discountPercent: number,
}

type SaleDetail = {
    id: number,
    name: string,
    slug: string
    description: string,
    discountPercent: number,
    startAt: Date,
    endAt: Date
}

type ProductDetail = {
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

type ProductsSearch = {
    products: Array<ProductDetail>
    hasMore: boolean
}

const SortBy  = {
    popularity: "popularity",
    price: "price",
    alphabet: "alphabet",
    newest: "newest",
    rarity: "rarity"
} as const 

type SortByType = typeof SortBy [keyof typeof SortBy ]

type ShopParams = {
    categories?: string[],
    rarities?: string[],
    isAscending?: boolean,
    sortBy?: SortByType,
    search?: string,
}

// Routes
type GetCategoriesResponse = {
    categories: string[]
}
type GetRaritiesResponse = {
    rarities: string[]
}
type GetSaleBySlugResponse = {
    sale: SaleDetail
}
type GetProductBySlugResponse = {
    product: ProductDetail
}
type PostProductsSearchRequest = {
    categories?: string[] | null,
    rarities?: string[] | null,
    isAscending?: boolean | null,
    sortBy?: SortByType | null,
    search?: string | null,
    limit?: number | null
    offset?: number | null
}
type PostProductsSearchResponse = {
    products: ProductDetail[]
    hasMore: boolean
}


export type {
    SaleSummary,
    SaleDetail,
    ProductDetail,
    ProductsSearch,
    SortByType,
    ShopParams,
    GetCategoriesResponse,
    GetRaritiesResponse,
    GetSaleBySlugResponse,
    GetProductBySlugResponse,
    PostProductsSearchRequest,
    PostProductsSearchResponse,
}
export {SortBy}