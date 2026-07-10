
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
    saleSlug: string | null
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

type SalesState = {
    [slug: string]: SaleDetail
}

// Routes
type GetCategoriesResponse = {
    categories: string[]
}
type GetRaritiesResponse = {
    rarities: string[]
}
type GetSalesRouteResponse = {
    sales: SaleDetail[]
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
    SaleDetail,
    ProductDetail,
    ProductsSearch,
    SortByType,
    ShopParams,
    SalesState,
    GetCategoriesResponse,
    GetRaritiesResponse,
    GetSalesRouteResponse,
    GetProductBySlugResponse,
    PostProductsSearchRequest,
    PostProductsSearchResponse,
}
export {SortBy}