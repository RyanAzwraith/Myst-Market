import { faker } from "@faker-js/faker"

import type {
    Attention,
    GraphPoint,
    Performance,
    Stats,
} from "@/features/app/schema"

export {
    stats,
    attention,
    graphPoints,
    performance,
}

faker.seed(12345)

const stats: Stats = {
    product_count: 25,
    customer_count: 25,
    total_average_rating: 4.2,
}

const attention: Attention = {
    pendingOrders: 3,
    outOfStockProducts: 2,
    salesEnding: 1,
}

const graphPoints: GraphPoint[] = Array.from(
    { length: 6 },
    () => ({
        month: faker.date.month(),
        revenue: faker.number.int({ min: 1000, max: 50000 }),
        orders: faker.number.int({ min: 1, max: 100 }),
    }),
)

const performance: Performance = {
    periodDays: 30,
    revenue: 125000,
    orders: 80,
    newCustomers: 25,
    revenueLost: 5000,
    previousRevenue: 110000,
    previousOrders: 72,
    previousNewCustomers: 20,
    previousRevenueLost: 4000,
}
