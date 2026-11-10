
export type {
    Stats,
    Performance,
    Attention,
    Graph,
    GraphPoint,
}

type Stats = {
    productCount: number,
    customerCount: number,
    totalAverageRating: number,
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
