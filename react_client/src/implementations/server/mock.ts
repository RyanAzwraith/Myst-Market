import type * as Interface from "@/interfaces/server"

import {
    attention,
    graphPoints,
    performance,
    stats,
} from "../../../mock_data/app"
import { mockAccessToken } from "../../../mock_data/auth"
import { itemResolutions } from "../../../mock_data/item"
import { media, medias } from "../../../mock_data/media"
import {
    order,
    orders,
    orderSummaries,
} from "../../../mock_data/order"
import {
    product,
    products,
    productAnalytics,
    productAnalytic,
} from "../../../mock_data/product"
import { review, reviews } from "../../../mock_data/review"
import {
    sale,
    sales,
    saleAnalytics,
    saleAnalytic,
} from "../../../mock_data/sale"
import {
    user,
    userAnalytics,
    userDetail,
    userFactory,
    userAnalytic,
    users,
} from "../../../mock_data/user"

export {
    mockImplementation,
}

const app: Interface.App = {
    getStats: async () => ({ stats }),
    getAttention: async () => ({ attention }),
    getGraph: async () => ({ graphPoints }),
    retrievePerformance: async () => ({ performance }),
}

const auth: Interface.Auth = {
    refresh: async () => ({
        accessToken: mockAccessToken,
    }),
    login: async () => ({
        accessToken: mockAccessToken,
        user,
    }),
    logout: async () => {},
}

const userInterface: Interface.User = {
    getReviews: async () => ({ reviews }),
    getOrder: async () => ({ order }),
    getOrders: async () => ({ orders: orderSummaries }),
    getAnalytics: async () => ({ user: userAnalytic }),
    create: async () => {},
    patch: async (req) => ({
        user: userFactory(req.userInput),
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
        users: userAnalytics,
        hasMore: false,
    }),
}

const saleInterface: Interface.Sale = {
    getBySlug: async () => ({ sale }),
    getImage: async () => ({ media }),
    getMedias: async () => ({ medias }),
    getAnalytics: async () => ({ sale: saleAnalytic }),
    create: async () => {},
    patch: async () => {},
    delete: async () => {},
}

const salesInterface: Interface.Sales = {
    getAll: async () => ({ sales }),
    retrieveBiggest: async () => ({ sales, images: medias }),
    adminSearch: async () => ({
        sales: saleAnalytics,
        hasMore: false,
    }),
    patch: async () => {},
    import: async () => ({
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [],
    }),
    export: async () => new Blob(),
}

const productInterface: Interface.Product = {
    getBySlug: async () => ({ product }),
    getImage: async () => ({ media }),
    getMedias: async () => ({ medias }),
    getReviews: async () => ({
        reviews,
        average: 4,
        userHasReview: false,
    }),
    getAnalytics: async () => ({ product: productAnalytic }),
    create: async () => {},
    patch: async () => {},
    delete: async () => {},
}

const productsInterface: Interface.Products = {
    retrieveFeatured: async () => ({
        products,
        images: medias,
    }),
    retrievePopular: async () => ({
        products,
        images: medias,
    }),
    retrieveNewest: async () => ({
        products,
        images: medias,
    }),
    retrieveMostSoldProducts: async () => ({
        products: productAnalytics,
        images: medias,
    }),
    search: async () => ({
        products,
        images: medias,
        hasMore: false,
    }),
    adminSearch: async () => ({
        products: productAnalytics,
        hasMore: false,
    }),
    patch: async () => {},
    import: async () => ({
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [],
    }),
    export: async () => new Blob(),
}

const reviewInterface: Interface.Review = {
    create: async () => {},
    delete: async () => {},
}

const reviewsInterface: Interface.Reviews = {
    retrieveTestimonials: async () => ({ reviews }),
}

const itemsInterface: Interface.Items = {
    resolve: async () => ({
        items: itemResolutions,
        totalCent: 1000,
    }),
}

const orderInterface: Interface.Order = {
    getById: async () => ({
        order,
        user: userDetail,
    }),
    create: async () => ({
        stripeSessionUrl: "mock-stripe-session-url",
    }),
    patchStatus: async () => {},
}

const ordersInterface: Interface.Orders = {
    getRecent: async () => ({ orders }),
    adminSearch: async () => ({
        orders: orderSummaries,
        hasMore: false,
    }),
    patchStatus: async () => {},
}

const mockImplementation: Interface.Server = {
    app,
    auth,
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
