import type * as Interface from "@/interfaces/server"

import { 
    actionRequest, 
    authRequest, 
    request 
} from "./http/request"
import { serverRoutes } from "./http/serverRoutes"

export {
    httpImplementation,
}

const app: Interface.App = {
    getStats: () => request(serverRoutes.app.stats),
    getPerformance: () => authRequest(serverRoutes.app.performance),
    getAttention: () => authRequest(serverRoutes.app.attention),
    getGraph: () => authRequest(serverRoutes.app.graph),
}

const auth: Interface.Auth = {
    refresh: () =>
        request(serverRoutes.auth.refresh, {
            method: "GET",
        }),
    login: (req) =>
        request(serverRoutes.auth.login, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    logout: () =>
        request(serverRoutes.auth.logout, {
            method: "POST",
        }),
}

const user: Interface.User = {
    getReviews: () =>
        authRequest(serverRoutes.user.reviews, {
            method: "GET",
        }),
    getOrder: (orderId) =>
        authRequest(serverRoutes.user.order(orderId), {
            method: "GET",
        }),
    getOrders: () =>
        authRequest(serverRoutes.user.orders, {
            method: "GET",
        }),
    getAnalytics: (id) =>
        authRequest(serverRoutes.user.analytics(id), {
            method: "GET",
        }),
    create: (req) =>
        request(serverRoutes.user.create, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    patch: (req) =>
        authRequest(serverRoutes.user.me, {
            method: "PATCH",
            body: JSON.stringify(req),
        }),
    patchPassword: (req) =>
        actionRequest(serverRoutes.user.password, {
            method: "PATCH",
            body: JSON.stringify(req),
        }),
    passwordEmail: () =>
        authRequest(serverRoutes.user.passwordEmail, {
            method: "POST",
        }),
    delete: () =>
        authRequest(serverRoutes.user.me, {
            method: "DELETE",
        }),
}

const users: Interface.Users = {
    adminSearch: (req) =>
        authRequest(serverRoutes.users.search, {
            method: "POST",
            body: JSON.stringify(req),
        }),
}

const sale: Interface.Sale = {
    getBySlug: (slug) =>
        request(
            serverRoutes.sale.bySlug(slug),
        ),
    getImage: (id) =>
        request(
            serverRoutes.sale.image(id),
        ),
    getMedias: (id) =>
        request(
            serverRoutes.sale.medias(id),
        ),
    getAnalytics: (id) =>
        authRequest(serverRoutes.sale.analytics(id)),
    create: (req) =>
        authRequest(serverRoutes.sale.create, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    patch: (id, req) =>
        authRequest(serverRoutes.sale.byId(id), {
            method: "PATCH",
            body: JSON.stringify(req),
        }),
    delete: (id) =>
        authRequest(serverRoutes.sale.byId(id), {
            method: "DELETE",
        }),
}

const sales: Interface.Sales = {
    getAll: () =>
        authRequest(serverRoutes.sales.all, {
            method: "GET",
        }),
    retrieveBiggest: (req) =>
        request(serverRoutes.sales.biggest, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    adminSearch: (req) =>
        authRequest(serverRoutes.sales.search, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    patch: (req) =>
        authRequest(serverRoutes.sales.all, {
            method: "PATCH",
            body: JSON.stringify(req),
        }),
    import: ({ file }) => {
        const body = new FormData()
        body.append("file", file, file.name)
        return authRequest(
            serverRoutes.sales.import, {
                method: "POST",
                body,
        })
    },
    export: () => 
        authRequest(
            serverRoutes.sales.export, {
                responseType: "blob",
        }),
}

const product: Interface.Product = {
    getBySlug: (slug) =>
        request(
            serverRoutes.product.bySlug(slug),
        ),
    getImage: (id) =>
        request(
            serverRoutes.product.image(id),
        ),
    getMedias: (id) =>
        request(
            serverRoutes.product.medias(id),
        ),
    getReviews: (id) =>
        request(
            serverRoutes.product.reviews(id),
        ),
    getAnalytics: (id) =>
        authRequest(
            serverRoutes.product.analytics(id),
        ),
    create: (req) =>
        authRequest(
            serverRoutes.product.create, {
                method: "POST",
                body: JSON.stringify(req),
        }),
    patch: (id, req) =>
        authRequest(
            serverRoutes.product.byId(id), {
                method: "PATCH",
                body: JSON.stringify(req),
        }),
    delete: (id) =>
        authRequest(
            serverRoutes.product.byId(id), {
                method: "DELETE",
        }),
}

const products: Interface.Products = {
    retrieveFeatured: (req) =>
        request(serverRoutes.products.featured, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    retrievePopular: (req) =>
        request(serverRoutes.products.popular, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    retrieveNewest: (req) =>
        request(serverRoutes.products.newest, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    retrieveMostSoldProducts: (req: { 
        limit: number
    }) =>
        request(serverRoutes.products.mostSold, {
            method: "POST",
            body: JSON.stringify(req),
        }),
    search: (req) =>
        request(
            serverRoutes.products.search, {
                method: "POST",
                body: JSON.stringify(req),
        }),
    adminSearch: (req) =>
        authRequest(
            serverRoutes.products.search, {
                method: "POST",
                body: JSON.stringify(req),
        }),
    patch: (req) =>
        authRequest(
            serverRoutes.products.all, {
                method: "PATCH",
                body: JSON.stringify(req),
        }),
    import: ({ file }) => {
        const body = new FormData()
        body.append("file", file, file.name)
        return authRequest(
            serverRoutes.products.import, {
                method: "POST",
                body,
        })
    },
    export: () => 
        authRequest(
        serverRoutes.products.export, {
            responseType: "blob",
        }),
}

const review: Interface.Review = {
    create: (req) =>
        authRequest(serverRoutes.review.create, {
            method: "POST",
            body: JSON.stringify(req)
        }),
    delete: ({ reviewId }: { reviewId: number }) =>
        authRequest(serverRoutes.review.byId(reviewId), {
            method: "DELETE",
        }),


}
const reviews: Interface.Reviews = {
    retrieveTestimonials: (req) =>
        request(serverRoutes.reviews.testimonials, {
            method: "POST",
            body: JSON.stringify(req)
        })
}

const items: Interface.Items = {    
    resolve: (req) => 
        request(serverRoutes.items.resolve, {
            method: "POST",
            body: JSON.stringify(req),
        }),
}

const order: Interface.Order = {
    getById: (id) =>
        authRequest(
            serverRoutes.order.byId(id), {
                method: "GET",
        }),
    create: ({userInput, ...req}) => {
        if (userInput) 
            return request(serverRoutes.order.create, {
                method: "POST",
                body: JSON.stringify({ userInput, ...req }),
            })
        return authRequest(serverRoutes.order.create, {
                method: "POST",
                body: JSON.stringify({ userInput, ...req }),
            })
    },
    patchStatus: (id, req) =>
        authRequest(
            serverRoutes.order.status(id), {
                method: "PATCH",
                body: JSON.stringify(req),
        }),
}

const orders: Interface.Orders = {
    getRecent: () => authRequest(serverRoutes.orders.recent),
    adminSearch: (req) =>
        authRequest(
            serverRoutes.orders.search, {
                method: "POST",
                body: JSON.stringify(req),
            }),
    patchStatus: (req) =>
        authRequest(
            serverRoutes.orders.status, {
                method: "PATCH",
                body: JSON.stringify(req),
        }),
}

const httpImplementation: Interface.Server = {
    app,
    auth,
    user,
    users,
    sale,
    sales,
    product,
    products,
    review,
    reviews,
    items,
    order,
    orders,
}