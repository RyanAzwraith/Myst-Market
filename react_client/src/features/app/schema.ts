
export type {
    Stats,
    Performance,
    Attention,
    Graph,
    GraphPoint,
}

type Stats = {
    product_count: number,
    customer_count: number,
    total_average_rating: number,
}

type Performance = {
    periodDays: number
    revenue: number
    orders: number
    newCustomers: number
    revenueLost: number
    previousRevenue: number
    previousOrders: number
    previousNewCustomers: number
    previousRevenueLost: number
}

type Attention = {
    pendingOrders: number
    outOfStockProducts: number
    salesEnding: number
}

type GraphPoint = {
    month: string
    revenue: number
    orders: number
}

type Graph = {
    points: GraphPoint[]
}
