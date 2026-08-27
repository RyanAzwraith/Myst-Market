export { serverRoutes }

const app = {
    stats: "/stats",
    performance: "/performance", // Admin
    attention: "/attention", // Admin
    graph: "/graph", // Admin
} as const

const auth = {
    refresh: "/refresh",
    login: "/login",
    logout: "/logout",
} as const

const user = {
    create: "/user",
    me: "/user/me", // Authenticated
    password: "/user/me/password", // Authenticated
    passwordEmail: "/user/me/password-email", // Authenticated
    reviews: "/user/me/reviews", // Authenticated
    order: (orderId: number) => `/user/orders/${orderId}`, // Authenticated
    orders: "/user/orders", // Authenticated
    analytics: (userId: number) => `/users/${userId}/analytics`, // Admin
} as const
const users = {
    search: "/users/search", // Admin
} as const

const sale = {
    create: "/sale", // Admin
    byId: (id: number) => `/sale/${id}`, // Admin
    bySlug: (id: string) => `/sale/${id}`,
    image: (id: number) => `/sale/${id}/image`,
    medias: (id: number) => `/sale/${id}/media`,
    analytics: (id: number) => `/sale/${id}/analytics`, // Admin
} as const
const sales = {
    all: "/sales", // Admin
    biggest: "/sales/biggest",
    search: "/sales/search", // Admin
    import: "/sales/import", // Admin
    export: "/sales/export", // Admin
} as const

const product = {
    create: "/product", // Admin
    byId: (id: number) => `/products/${id}`, // Admin
    bySlug: (slug: string) => `/product/${slug}`,
    image: (id: number) => `/product/${id}/image`,
    medias: (id: number) => `/product/${id}/medias`,
    reviews: (id: number) => `/product/${id}/reviews`,
    analytics: (id: number) => `/products/${id}/analytics`, // Admin
} as const
const products = {
    all: "/products", // Admin
    featured: "/products/featured",
    popular: "/products/popular",
    newest: "/products/newest",
    mostSold: "/products/most-sold",
    search: "/products/search", // Admin and unauthenticated
    import: "/products/import", // Admin
    export: "/products/export", // Admin
} as const

const review = {
    create: "/review",
    byId: (id: number) => `/review/${id}`, // Authenticated
} as const

const reviews = {
    testimonials: "/reviews/testimonials",
} as const

const items = {
    resolve: "/items/resolve",
} as const

const order = {
    create: "/order",
    byId: (id: number) => `/orders/${id}`, // Authenticated
    user: (id: number) => `/orders/${id}/user`, // Admin
    status: (id: number) => `/orders/${id}/status`, // Admin
} as const
const orders = {
    recent: "/orders/recent", // Admin
    search: "/orders/search", // Admin
    status: "/orders/status", // Admin
} as const

const serverRoutes = {
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
} as const

