import type * as Interface from "@/interfaces/server"

import {
    attention,
    graphPoints,
    performance,
    stats,
} from "../../../mock_data/app"
import { mockAccessToken } from "../../../mock_data/auth"
import { itemResolutionList } from "../../../mock_data/item"
import {
    media,
    mediaList,
    mediaFactory,
} from "../../../mock_data/media"
import {
    order,
    orderList,
    orderSummaryList,
} from "../../../mock_data/order"
import {
    product,
    productList,
    productAnalyticsList,
    productAnalytic,
} from "../../../mock_data/product"
import {
    reviewList,
} from "../../../mock_data/review"
import {
    sale,
    saleList,
    saleAnalytics,
    saleAnalyticsList,
} from "../../../mock_data/sale"
import {
    user,
    userAnalytics,
    userDetail,
    userFactory,
    userAnalyticsList,
    adminUser,
} from "../../../mock_data/user"

export {
    mockImplementation,
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
    }),
    login: async (req) => ({
        accessToken: mockAccessToken,
        user: req.login.email == adminUser.email ? adminUser : user,
    }),
    logout: async () => {},
}

const userInterface: Interface.User = {
    getReviews: async () => ({ reviews: reviewList }),
    getOrder: async () => ({ order }),
    getOrders: async () => ({ orders: orderSummaryList }),
    getAnalytics: async () => ({ user: userAnalytics }),
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
        users: userAnalyticsList,
        hasMore: true,
    }),
}

const saleInterface: Interface.Sale = {
    getBySlug: async () => ({ sale }),
    getImage: async () => ({ media }),
    getMedias: async () => ({ medias: mediaList }),
    getAnalytics: async () => ({ sale: saleAnalytics }),
    create: async () => {},
    patch: async () => {},
    delete: async () => {},
}

const salesInterface: Interface.Sales = {
    getAll: async () => ({ sales: saleList }),
    retrieveBiggest: async () => ({
        sales: saleList,
        images: saleList.map((p) => mediaFactory({}, { id: p.id, type: "sale" })),
    }),
    adminSearch: async () => ({
        sales: saleAnalyticsList,
        hasMore: true,
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
    getMedias: async () => ({ medias: mediaList }),
    getReviews: async () => ({
        reviews: reviewList,
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
        products: productList,
        images: productList.map((p) => mediaFactory({}, { id: p.id, type: "product" })),
    }),
    retrievePopular: async () => ({
        products: productList,
        images: productList.map((p) => mediaFactory({}, { id: p.id, type: "product" })),
    }),
    retrieveNewest: async () => ({
        products: productList,
        images: productList.map((p) => mediaFactory({}, { id: p.id, type: "product" })),
    }),
    retrieveMostSoldProducts: async () => ({
        products: productAnalyticsList,
        images: productAnalyticsList.map((p) => mediaFactory({}, { id: p.id, type: "product" })),
    }),
    search: async () => ({
        products: productList,
        images: productList.map((p) => mediaFactory({}, { id: p.id, type: "product" })),
        hasMore: true,
    }),
    adminSearch: async () => ({
        products: productAnalyticsList,
        hasMore: true,
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
    retrieveTestimonials: async () => ({ reviews: reviewList }),
}

const itemsInterface: Interface.Items = {
    resolve: async () => ({
        items: itemResolutionList,
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
