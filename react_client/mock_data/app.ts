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

const statsFactory = (): Stats => ({
    product_count: faker.number.int({ min: 1, max: 100 }),
    customer_count: faker.number.int({ min: 1, max: 100 }),
    total_average_rating: faker.number.float({
        min: 1,
        max: 5,
        fractionDigits: 1,
    }),
})

const attentionFactory = (): Attention => ({
    pendingOrders: faker.number.int({ min: 0, max: 20 }),
    outOfStockProducts: faker.number.int({ min: 0, max: 20 }),
    salesEnding: faker.number.int({ min: 0, max: 10 }),
})

const graphPointFactory = (): GraphPoint => ({
        month: faker.date.month(),
        revenue: faker.number.int({ min: 1000, max: 50000 }),
        orders: faker.number.int({ min: 1, max: 100 }),
    })

const performanceFactory = (): Performance => ({
    periodDays: 30,
    revenue: faker.number.int({ min: 10000, max: 250000 }),
    orders: faker.number.int({ min: 1, max: 500 }),
    newCustomers: faker.number.int({ min: 1, max: 100 }),
    revenueLost: faker.number.int({ min: 0, max: 20000 }),
    previousRevenue: faker.number.int({ min: 10000, max: 250000 }),
    previousOrders: faker.number.int({ min: 1, max: 500 }),
    previousNewCustomers: faker.number.int({ min: 1, max: 100 }),
    previousRevenueLost: faker.number.int({ min: 0, max: 20000 }),
})

const stats: Stats = statsFactory()
const attention: Attention = attentionFactory()
const graphPoints: GraphPoint[] = Array.from(
    { length: 6 },
    () => graphPointFactory(),
)
const performance: Performance = performanceFactory()
