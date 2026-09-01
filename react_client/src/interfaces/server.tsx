import type * as app from "@/features/app/schema"
import type * as auth from "@/features/auth/schema"
import type * as item from "@/features/item/schema"
import type * as media from "@/features/media/schema"
import type * as order from "@/features/order/schema"
import type * as product from "@/features/product/schema"
import type * as review from "@/features/review/schema"
import type * as sale from "@/features/sale/schema"
import type * as user from "@/features/user/schema"

export type {
    Server,
    App,
    Auth,
    User,
    Users,
    Sale,
    Sales,
    Product,
    Products,
    Review,
    Reviews,
    Items,
    Order,
    Orders,
}

interface Server {
    app: App
    auth: Auth
    user: User
    users: Users
    sale: Sale
    sales: Sales
    product: Product
    products: Products
    review: Review
    reviews: Reviews
    items: Items
    order: Order
    orders: Orders
}

interface App {
    getStats: () => Promise<{
        stats: {
            product_count: number,
            customer_count: number,
            total_average_rating: number,
        }
    }>
    getPerformance: () => Promise<{ performance: app.Performance }>
    getAttention: () => Promise<{ attention: app.Attention }>
    getGraph: () => Promise<{ graphPoints: app.GraphPoint[] }>
}

interface Auth {
    refresh: () => Promise<{ accessToken: string }>

    login: (req : { 
        login: auth.Login 
    }) => Promise<{
        accessToken: string;
        user: user.User; 
    }>

    logout: () => Promise<void> 
}

interface User {
    getReviews: () => Promise<{ reviews: review.Review[] }>

    getOrder: (orderId: number) => Promise<{ order: order.Order }>

    getOrders: () => Promise<{ orders: order.OrderSummary[] }>

    getAnalytics: (id: number) => Promise<{
        user: user.UserAnalytics
    }>

    create: (req: {
        userInput: user.UserInput
    }) => Promise<void>

    patch: (req: {
        userInput: Partial<user.UserInput>
    }) => Promise<{ user: user.User }>

    patchPassword: (req: {
        password: string
    }) => Promise<{
        accessToken: string
        user: user.User
    }>

    passwordEmail: () => Promise<void>

    delete: () => Promise<void>

}
interface Users {
    adminSearch: (req : {
        searchParams: Partial<user.AdminSearchParams> | null,
        limit: number | null,
        offset: number
    }) => Promise<{ 
        users: user.UserAnalytics[], 
        hasMore: boolean 
    }>
}

interface Sale {
    getBySlug: (slug: string) => Promise<{ sale: sale.Sale }>

    getImage: (id: number) => Promise<{ media: media.MediaDetail} >

    getMedias: (id: number) => Promise<{ medias: media.MediaDetail[] }>

    getAnalytics: (id: number) => Promise<{ sale: sale.SaleAnalytics }>

    create: (req : Omit<sale.Sale, 'id'>) => Promise<void>

    patch: (id: number, req: Partial<sale.Sale>) => Promise<void>

    delete: (id: number) => Promise<void>

}

interface Sales {
    getAll: () => Promise<{ sales: sale.Sale[] }>

    retrieveBiggest: (req : { 
        limit: number
    }) => Promise<{ sales: sale.Sale[] }>

    adminSearch: (req : { 
        searchParams: Partial<sale.AdminSearchParams> | null,
        limit: number | null,
        offset: number
    }) => Promise<{ 
        sales: sale.SaleAnalytics[], 
        hasMore: boolean 
    }>

    patch: (req : Partial<
        {
        ids: number[]
        startAt: Date | null
        endAt: Date | null
        discountPercent: number | null
    }>) => Promise<void>

    import: (req : { 
        file: File 
    }) => Promise<{
        imported: number
        updated: number
        failed: number
        errors: {
            row: number
            field: string | null
            message: string
        }[]
    }>

    export: () => Promise<Blob>
}

interface Product {
    getBySlug: (slug: string) => Promise<{ product: product.Product }>

    getImage: (id: number) => Promise<{ media: media.MediaDetail} >

    getMedias: (id: number) => Promise<{ medias: media.MediaDetail[] }>

    getReviews: (id: number) => Promise<{ 
        reviews: review.Review[],
        average: number,
        userHasReview:boolean,
    }>

    getAnalytics: (id: number) => Promise<{ product: product.ProductAnalytics }>

    create: (req : { 
        name: string
        categoryName: string
        rarityName: string
        priceAudCent: number
        slug: string
        description: string
        stock: number
    }) => Promise<void>

    patch: (id: number, req: Partial<{
        name: string
        categoryName: string
        rarityName: string
        priceAudCent: number
        slug: string
        description: string
        stock: number
    }>) => Promise<void>

    delete: (id: number) => Promise<void>
}
interface Products {
    retrieveFeatured: (req : { 
        limit: number
    }) => Promise<{ 
        products: product.Product[]
        medias: media.MediaDetail[],
    }>

    retrievePopular: (req : { 
        limit: number
    }) => Promise<{ 
        products: product.Product[] 
        medias: media.MediaDetail[],
    }>

    retrieveNewest: (req : { 
        limit: number
    }) => Promise<{ 
        products: product.Product[] 
        medias: media.MediaDetail[],
    }>

    retrieveMostSoldProducts: (req : { 
        limit: number
    }) => Promise<{ 
        products: product.ProductAnalytics[] 
        medias: media.MediaDetail[],
    }>

    search: (req: { 
        searchParams: Partial<product.SearchParams> | null
        limit: number | null,
        offset: number
    }) => Promise<{ 
        products: product.Product[], 
        medias: media.MediaDetail[],
        hasMore: boolean 
    }>

    adminSearch: (req: { 
        searchParams: Partial<product.AdminSearchParams> | null
        limit: number | null,
        offset: number
    }) => Promise<{ 
        products: product.ProductAnalytics[], 
        hasMore: boolean 
    }>

    patch: (req : Partial<{
        productIds: number[]
        categoryName: string | null
        rarityName: string | null
        priceAudCent: number | null
        stock: number | null
    }>) => Promise<void>
    
    import: (req : { 
        file: File 
    }) => Promise<{
        imported: number
        updated: number
        failed: number
        errors: {
            row: number
            field: string | null
            message: string
        }[]
    }>

    export: () => Promise<Blob>
}

interface Review {
    create: (req : {
        reviewInput: review.ReviewInput
    }) => Promise<void>

    delete: (req : { 
        reviewId: number }
    ) => Promise<void>


}
interface Reviews {
    retrieveTestimonials: (req : { 
        limit: number
    }) => Promise<{
        reviews: review.Review[]
    }>
}

interface Items {
    resolve: (req : {
        items: item.ItemSummary[]
    }) => Promise<{ 
        items: item.ItemResolution[],
        totalCent: number
    }>
}

interface Order {
    getById: (id: number) => Promise<{ 
        order: order.Order,
        user: user.UserDetail
    }>

    create: (req : {
        items: item.ItemSummary[]
        address: order.Address
        deliveryNote: string
        user: user.UserInput | null
        isCreatingAccount: boolean  | null
    }) => Promise<{ stripeSessionUrl: string }>

    patchStatus: (id: number, req : {
        status: order.Status  
    }) => Promise<void>
}
interface Orders {
    getRecent: () => Promise<{ orders: order.Order[] }>

    adminSearch: (req : {
        searchParams: Partial<order.AdminSearchParams> | null,
        limit: number | null,
        offset: number
    }) => Promise<{ 
        orders: order.OrderSummary[],
        hasMore: boolean
    }>
    patchStatus: (req : {
        orderIds: number[]
        status: order.Status
    }) => Promise<void>  
}

