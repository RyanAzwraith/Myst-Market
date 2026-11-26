import type * as Interface from "@/interfaces/server"
import type * as App from "@/features/app/schema"
import type { MediaDetail } from "@/features/media/schema"
import type * as Item from "@/features/item/schema"
import type * as Order from "@/features/order/schema"
import type * as Product from "@/features/product/schema"
import type * as Review from "@/features/review/schema"
import type * as Sale from "@/features/sale/schema"
import type * as User from "@/features/user/schema"

import addressesData from "../../../mock_data/addresses.json"
import itemsData from "../../../mock_data/items.json"
import ordersData from "../../../mock_data/orders.json"
import productsData from "../../../mock_data/products.json"
import reviewsData from "../../../mock_data/reviews.json"
import saleProductsData from "../../../mock_data/sale_product.json"
import salesData from "../../../mock_data/sales.json"
import stockData from "../../../mock_data/stock.json"
import usersData from "../../../mock_data/users.json"

const productImageFiles = import.meta.glob(
    "../../../mock_data/media/product/*.png",
    { eager: true, import: "default", query: "?url" },
) as Record<string, string>

const saleImageFiles = import.meta.glob(
    "../../../mock_data/media/sale/*.png",
    { eager: true, import: "default", query: "?url" },
) as Record<string, string>

const mockAccessToken = "mock-access-token-json"
const stockByProductId = new Map(
    stockData.map((item) => [item.product_id, item.current]),
)

const userList: User.User[] = usersData.map((item) => ({
    id: item.id,
    email: item.email,
    name: item.name,
    isAdmin: item.is_admin,
}))

const user = userList.find((item) => !item.isAdmin) ?? userList[0]
const adminUser = userList.find((item) => item.isAdmin) ?? user

const userDetailList: User.UserDetail[] = usersData.map((item) => ({
    id: item.id,
    email: item.email,
    name: item.name,
    isRegistered: item.is_registered,
}))

const userDetailById = new Map(
    userDetailList.map((item) => [item.id, item]),
)

const salesList: Sale.Sale[] = salesData.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    discountPerc: item.discount_perc,
    startAt: item.start_at,
    endAt: item.end_at,
    description: item.description,
}))

const saleById = new Map(salesList.map((item) => [item.id, item]))
const saleIdByProductId = new Map(
    saleProductsData.map((item) => [item.product_id, item.sale_id]),
)

const saleSummaryForProduct = (
    productId: number,
): Sale.SaleSummary | null => {
    const saleId = saleIdByProductId.get(productId)
    const sale = saleId === undefined ? undefined : saleById.get(saleId)
    if (!sale) return null
    return {
        name: sale.name,
        slug: sale.slug,
        discountPerc: sale.discountPerc,
    }
}

const productList: Product.Product[] = productsData.map((item) => {
    const sale = saleSummaryForProduct(item.id)
    const discountedPrice = sale
        ? Math.round(item.price_aud_cent * (1 - sale.discountPerc / 100))
        : null

    return {
        id: item.id,
        name: item.name,
        categoryName: item.category as Product.Category,
        rarityName: item.rarity as Product.Rarity,
        priceAudCent: item.price_aud_cent,
        slug: item.slug,
        description: item.description,
        stock: stockByProductId.get(item.id) ?? 0,
        discountedPrice,
        sale,
    }
})

const product = productList[0]
const productById = new Map(productList.map((item) => [item.id, item]))
const productForId = (id: number) => productById.get(id) ?? product

const productAnalyticsList: Product.ProductAnalytics[] = productList.map((item) => {
    const source = productsData.find((productData) => productData.id === item.id)
    const unitsSold = source?.units_sold ?? 0

    return {
        ...item,
        discontinuedAt: source?.discontinued_at ?? null,
        createdAt: source?.created_at ?? "2026-01-01",
        unitsSold,
        revenue: item.priceAudCent * unitsSold,
        orderCount: unitsSold,
        refunds: 0,
        revenueLost: 0,
        averageRating: 4.5,
        reviews: 0,
    }
})

const productAnalytic = productAnalyticsList[0]
const analyticsById = new Map(
    productAnalyticsList.map((item) => [item.id, item]),
)
const analyticsForId = (id: number) => analyticsById.get(id) ?? productAnalytic

const productMedias = (item: Product.Product): MediaDetail[] => Object.entries(
    productImageFiles,
)
    .filter(([path]) => path.includes(`/${item.slug}-`))
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([, mediaUrl], index) => ({
        id: item.id * 100 + index,
        mediaType: "image" as const,
        mediaUrl,
        entityId: item.id,
        entityType: "product" as const,
        altText: item.name,
        sortOrder: index,
    }))

const saleMedias = (item: Sale.Sale): MediaDetail[] => Object.entries(
    saleImageFiles,
)
    .filter(([path]) => path.includes(`/${item.slug}-`))
    .map(([, mediaUrl], index) => ({
        id: item.id * 100 + index,
        mediaType: "image" as const,
        mediaUrl,
        entityId: item.id,
        entityType: "sale" as const,
        altText: item.name,
        sortOrder: index,
    }))

const productCoverImages = productList.flatMap((item) => (
    productMedias(item).slice(0, 1)
))

const reviewList: Review.Review[] = reviewsData.map((item) => ({
    id: item.id,
    userName: userList.find((userItem) => userItem.id === item.user_id)?.name
        ?? "Myst Market customer",
    productId: item.product_id,
    productSlug: productForId(item.product_id).slug,
    createdAt: item.created_at,
    rating: item.rating,
    description: item.description,
}))

const itemResolutionFor = (item: {
    product_id: number
    quantity: number
    unit_price_aud_cent: number
    sale_id: number | null
}): Item.ItemResolution => {
    const productItem = productForId(item.product_id)
    return {
        product: {
            id: productItem.id,
            saleID: item.sale_id,
            name: productItem.name,
            slug: productItem.slug,
        },
        quantity: item.quantity,
        unitPriceCent: item.unit_price_aud_cent,
        lineTotalCent: item.unit_price_aud_cent * item.quantity,
        onSale: item.sale_id !== null,
    }
}

const orderItemsFor = (orderId: number): Item.ItemResolution[] => itemsData
    .filter((item) => item.order_id === orderId)
    .map(itemResolutionFor)

const addressStringFor = (addressId: number) => {
    const address = addressesData.find((item) => item.id === addressId)
    if (!address) return "14 Lantern Row, Melbourne"
    return `${address.street}, ${address.city}`
}

const orderList: Order.Order[] = ordersData.map((item) => ({
    id: item.id,
    userId: item.user_id,
    addressString: addressStringFor(item.address_id),
    items: orderItemsFor(item.id),
    costAudCent: item.cost_aud_cent,
    createdAt: item.created_at,
    status: item.status as Order.Status,
}))

const order = orderList[0]
const orderSummaryList: Order.OrderSummary[] = orderList.map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    totalCent: item.costAudCent,
    status: item.status,
}))

const userAnalyticsList: User.UserAnalytics[] = usersData.map((item) => {
    const userOrders = ordersData.filter((orderItem) => orderItem.user_id === item.id)
    const userReviews = reviewsData.filter((reviewItem) => reviewItem.user_id === item.id)
    return {
        id: item.id,
        email: item.email,
        name: item.name,
        isRegistered: item.is_registered,
        createdAt: item.created_at,
        deletedAt: item.deleted_at,
        orderCount: userOrders.length,
        spent: userOrders.reduce((total, orderItem) => total + orderItem.cost_aud_cent, 0),
        revenueLost: 0,
        reviewCount: userReviews.length,
    }
})

const stats: App.Stats = {
    productCount: productList.length,
    customerCount: userList.filter((item) => !item.isAdmin).length,
    totalAverageRating: 4.5,
}

const attention: App.Attention = {
    pendingOrders: ordersData.filter((item) => item.status === "processing").length,
    outOfStockProducts: productList.filter((item) => item.stock === 0).length,
    salesEnding: 1,
}

const graphPoints: App.GraphPoint[] = ordersData.slice(0, 6).map((item) => ({
    month: item.created_at.slice(0, 7),
    revenue: item.cost_aud_cent,
    orders: 1,
}))

const performance: App.Performance = {
    periodDays: 30,
    revenue: ordersData.reduce((total, item) => total + item.cost_aud_cent, 0),
    orders: ordersData.length,
    newCustomers: userList.length,
    revenueLost: 0,
    previousRevenue: 0,
    previousOrders: 0,
    previousNewCustomers: 0,
    previousRevenueLost: 0,
}

const appInterface: Interface.App = {
    getStats: async () => ({ stats }),
    getAttention: async () => ({ attention }),
    getGraph: async () => ({ graphPoints }),
    retrievePerformance: async () => ({ performance }),
}

const authInterface: Interface.Auth = {
    refresh: async () => ({
        accessToken: mockAccessToken,
        user,
    }),
    login: async (req) => ({
        accessToken: mockAccessToken,
        user: req.login.email === adminUser.email ? adminUser : user,
    }),
    logout: async () => {},
}

const userInterface: Interface.User = {
    getReviews: async () => ({ reviews: reviewList }),
    getOrder: async (id) => ({
        order: orderList.find((item) => item.id === id) ?? order,
    }),
    getOrders: async () => ({ orders: orderSummaryList }),
    getAnalytics: async (id) => ({
        user: userAnalyticsList.find((item) => item.id === id) ?? userAnalyticsList[0],
    }),
    create: async () => ({
        setPasswordToken: mockAccessToken,
    }),
    patch: async (req) => ({
        user: { ...user, ...req.userInput },
    }),
    patchPassword: async () => ({
        accessToken: mockAccessToken,
        user,
    }),
    passwordEmail: async () => {},
    delete: async () => {},
}

const usersInterface: Interface.Users = {
    adminSearch: async () => ({
        users: userAnalyticsList,
        hasMore: true,
    }),
}

const saleInterface: Interface.Sale = {
    getBySlug: async (slug) => ({
        sale: salesList.find((item) => item.slug === slug) ?? salesList[0],
    }),
    getImage: async (id) => ({
        media: saleMedias(salesList.find((item) => item.id === id) ?? salesList[0])[0],
    }),
    getMedias: async (id) => ({
        medias: saleMedias(salesList.find((item) => item.id === id) ?? salesList[0]),
    }),
    getAnalytics: async (id) => ({
        sale: {
            ...(salesList.find((item) => item.id === id) ?? salesList[0]),
            revenue: 0,
            orderCount: 0,
            revenueLost: 0,
        },
    }),
    create: async () => {},
    patch: async () => {},
    delete: async () => {},
}

const salesInterface: Interface.Sales = {
    getAll: async () => ({ sales: salesList }),
    retrieveBiggest: async () => ({
        sales: salesList,
        images: salesList.flatMap((item) => saleMedias(item).slice(0, 1)),
    }),
    adminSearch: async () => ({
        sales: salesList.map((item) => ({
            ...item,
            revenue: 0,
            orderCount: 0,
            revenueLost: 0,
        })),
        hasMore: true,
    }),
    patch: async () => {},
}

const productInterface: Interface.Product = {
    getBySlug: async (slug) => ({
        product: productList.find((item) => item.slug === slug) ?? product,
    }),
    getImage: async (id) => ({ media: productMedias(productForId(id))[0] }),
    getMedias: async (id) => ({ medias: productMedias(productForId(id)) }),
    getReviews: async (id) => {
        const reviews = reviewList.filter((item) => item.productId === id)
        const average = reviews.length === 0
            ? 0
            : reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
        return { reviews, average, userHasReview: false }
    },
    getAnalytics: async (id) => ({ product: analyticsForId(id) }),
    create: async () => {},
    patch: async () => {},
    delete: async () => {},
}

const productsInterface: Interface.Products = {
    retrieveFeatured: async () => ({
        products: productList,
        images: productCoverImages,
    }),
    retrievePopular: async () => ({
        products: productList,
        images: productCoverImages,
    }),
    retrieveNewest: async () => ({
        products: productList,
        images: productCoverImages,
    }),
    retrieveMostSoldProducts: async () => ({
        products: productAnalyticsList,
        images: productCoverImages,
    }),
    search: async () => ({
        products: productList,
        images: productCoverImages,
        hasMore: true,
    }),
    adminSearch: async () => ({
        products: productAnalyticsList,
        hasMore: true,
    }),
    patch: async () => {},
}

const reviewInterface: Interface.Review = {
    create: async () => {},
    delete: async () => {},
}

const reviewsInterface: Interface.Reviews = {
    retrieveTestimonials: async () => ({ reviews: reviewList.slice(0, 6) }),
}

const itemsInterface: Interface.Items = {
    resolve: async (req) => {
        const items = req.items.map((item) => {
            const productItem = productForId(item.productId)
            const unitPriceCent = productItem.discountedPrice ?? productItem.priceAudCent
            return {
                product: {
                    id: productItem.id,
                    saleID: saleIdByProductId.get(productItem.id) ?? null,
                    name: productItem.name,
                    slug: productItem.slug,
                },
                quantity: item.quantity,
                unitPriceCent,
                lineTotalCent: unitPriceCent * item.quantity,
                onSale: productItem.sale !== null,
            }
        })
        return {
            items,
            totalCent: items.reduce((total, item) => total + item.lineTotalCent, 0),
        }
    },
}

const orderInterface: Interface.Order = {
    getById: async (id) => {
        const selectedOrder = orderList.find((item) => item.id === id) ?? order
        return {
            order: selectedOrder,
            user: userDetailById.get(selectedOrder.userId) ?? userDetailList[0],
        }
    },
    getAdminById: async (id) => {
        const selectedOrder = orderList.find((item) => item.id === id) ?? order
        return {
            order: selectedOrder,
            user: userDetailById.get(selectedOrder.userId) ?? userDetailList[0],
        }
    },
    create: async () => ({
        stripeSessionUrl: "/Myst-Market/mock-stripe-session-url",
    }),
    patchStatus: async () => {},
}

const ordersInterface: Interface.Orders = {
    getRecent: async () => ({ orders: orderList }),
    adminSearch: async () => ({
        orders: orderSummaryList,
        hasMore: true,
    }),
    patchStatus: async () => {},
}

const mockImplementation: Interface.Server = {
    app: appInterface,
    auth: authInterface,
    user: userInterface,
    users: usersInterface,
    sale: saleInterface,
    sales: salesInterface,
    product: productInterface,
    products: productsInterface,
    review: reviewInterface,
    reviews: reviewsInterface,
    items: itemsInterface,
    order: orderInterface,
    orders: ordersInterface,
}

export {
    mockImplementation,
}
